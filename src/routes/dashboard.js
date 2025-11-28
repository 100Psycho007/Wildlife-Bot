const express = require('express');
const Report = require('../models/Report');
const Responder = require('../models/Responder');
const Geofence = require('../models/Geofence');
const Escalation = require('../models/Escalation');
const Audit = require('../models/Audit');
const { verifyToken, requireRole } = require('../middleware/auth');
const { maskPhoneNumber, decryptField } = require('../utils/encryption');
const logger = require('../utils/logger');

const router = express.Router();

// All dashboard routes require authentication
router.use(verifyToken);

/**
 * Get reports with filtering and proper data masking
 */
router.get('/reports', async (req, res) => {
  try {
    const { 
      source,
      status, 
      category, 
      priority,
      language,
      startDate,
      endDate,
      page = 1, 
      limit = 20
    } = req.query;

    const filter = {};
    
    if (source) filter.source = source;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (language) filter.language = language;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const reports = await Report.find(filter)
      .populate('reporterId', 'whatsappNumber name')
      .populate('assignedResponder', 'name organization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);

    // Mask sensitive data based on role
    const maskedReports = reports.map(report => {
      const reportObj = report.toObject();
      
      // Mask phone for non-admin and non-assigned responders
      if (req.user.role !== 'ADMIN') {
        if (req.user.role !== 'RESPONDER' || 
            !report.assignedResponder || 
            report.assignedResponder._id.toString() !== req.user.id) {
          reportObj.phoneMasked = maskPhoneNumber(reportObj.phoneEncrypted ? decryptField(reportObj.phoneEncrypted) : reportObj.reporterId?.whatsappNumber);
          delete reportObj.phoneEncrypted;
        } else {
          // Assigned responder can see full phone
          reportObj.phone = decryptField(reportObj.phoneEncrypted);
        }
      } else {
        // Admin sees full phone
        reportObj.phone = decryptField(reportObj.phoneEncrypted);
      }

      // Mask GPS for non-admin and non-assigned responders
      if (req.user.role !== 'ADMIN') {
        if (req.user.role !== 'RESPONDER' || 
            !report.assignedResponder || 
            report.assignedResponder._id.toString() !== req.user.id) {
          // Only show district
          if (reportObj.location) {
            delete reportObj.location.coordinates;
            delete reportObj.location.latEncrypted;
            delete reportObj.location.lngEncrypted;
          }
        } else {
          // Assigned responder sees full coords
          if (reportObj.location?.latEncrypted && reportObj.location?.lngEncrypted) {
            reportObj.location.coordinates = {
              latitude: parseFloat(decryptField(reportObj.location.latEncrypted)),
              longitude: parseFloat(decryptField(reportObj.location.lngEncrypted))
            };
          }
        }
      } else {
        // Admin sees full coords
        if (reportObj.location?.latEncrypted && reportObj.location?.lngEncrypted) {
          reportObj.location.coordinates = {
            latitude: parseFloat(decryptField(reportObj.location.latEncrypted)),
            longitude: parseFloat(decryptField(reportObj.location.lngEncrypted))
          };
        }
      }

      return reportObj;
    });

    res.json({
      reports: maskedReports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Failed to fetch dashboard reports', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

/**
 * Get single report with proper access control
 */
router.get('/reports/:caseId', async (req, res) => {
  try {
    const report = await Report.findOne({ caseId: req.params.caseId })
      .populate('reporterId', 'whatsappNumber name contactInfo')
      .populate('assignedResponder', 'name organization contactInfo');

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const reportObj = report.toObject();

    // Apply same masking logic
    if (req.user.role !== 'ADMIN') {
      if (req.user.role !== 'RESPONDER' || 
          !report.assignedResponder || 
          report.assignedResponder._id.toString() !== req.user.id) {
        reportObj.phoneMasked = maskPhoneNumber(reportObj.phoneEncrypted ? decryptField(reportObj.phoneEncrypted) : reportObj.reporterId?.whatsappNumber);
        delete reportObj.phoneEncrypted;
        
        if (reportObj.location) {
          delete reportObj.location.coordinates;
          delete reportObj.location.latEncrypted;
          delete reportObj.location.lngEncrypted;
        }
      } else {
        reportObj.phone = decryptField(reportObj.phoneEncrypted);
        if (reportObj.location?.latEncrypted && reportObj.location?.lngEncrypted) {
          reportObj.location.coordinates = {
            latitude: parseFloat(decryptField(reportObj.location.latEncrypted)),
            longitude: parseFloat(decryptField(reportObj.location.lngEncrypted))
          };
        }
      }
    } else {
      reportObj.phone = decryptField(reportObj.phoneEncrypted);
      if (reportObj.location?.latEncrypted && reportObj.location?.lngEncrypted) {
        reportObj.location.coordinates = {
          latitude: parseFloat(decryptField(reportObj.location.latEncrypted)),
          longitude: parseFloat(decryptField(reportObj.location.lngEncrypted))
        };
      }
    }

    res.json(reportObj);
  } catch (error) {
    logger.error('Failed to fetch report', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

/**
 * Accept a case (responders only)
 */
router.post('/reports/:caseId/accept', requireRole('RESPONDER', 'ADMIN'), async (req, res) => {
  try {
    const report = await Report.findOne({ caseId: req.params.caseId });
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.status !== 'pending') {
      return res.status(400).json({ error: 'Case already assigned' });
    }

    // Find responder by user ID
    const responder = await Responder.findOne({ 
      whatsappNumber: req.user.whatsappNumber 
    });

    if (!responder && req.user.role === 'RESPONDER') {
      return res.status(404).json({ error: 'Responder profile not found' });
    }

    report.assignedResponder = responder?._id || req.user.id;
    report.status = 'accepted';
    await report.addTimelineEntry('accepted', req.user.name, 'Case accepted via dashboard');

    // Audit log
    logger.info('Case accepted', { 
      caseId: req.params.caseId, 
      userId: req.user.id,
      userName: req.user.name 
    });

    res.json(report);
  } catch (error) {
    logger.error('Failed to accept case', { error: error.message });
    res.status(500).json({ error: 'Failed to accept case' });
  }
});

/**
 * Resolve a case (responders only)
 */
router.post('/reports/:caseId/resolve', requireRole('RESPONDER', 'ADMIN'), async (req, res) => {
  try {
    const { resolution } = req.body;
    const report = await Report.findOne({ caseId: req.params.caseId });
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    report.status = 'resolved';
    await report.addTimelineEntry('resolved', req.user.name, resolution || 'Case resolved via dashboard');

    // Audit log
    logger.info('Case resolved', { 
      caseId: req.params.caseId, 
      userId: req.user.id,
      userName: req.user.name 
    });

    res.json(report);
  } catch (error) {
    logger.error('Failed to resolve case', { error: error.message });
    res.status(500).json({ error: 'Failed to resolve case' });
  }
});

/**
 * Presence - Responder heartbeat
 */
router.post('/presence/ping', requireRole('RESPONDER', 'ADMIN'), async (req, res) => {
  try {
    const { responderId, coords } = req.body;
    
    const responder = await Responder.findById(responderId || req.user.responderId);
    
    if (!responder) {
      return res.status(404).json({ error: 'Responder not found' });
    }
    
    responder.lastSeen = new Date();
    responder.status = 'online';
    
    if (coords && coords.lat && coords.lng) {
      responder.location = responder.location || {};
      responder.location.coordinates = {
        latitude: coords.lat,
        longitude: coords.lng
      };
    }
    
    await responder.save();
    
    res.json({ success: true, lastSeen: responder.lastSeen });
  } catch (error) {
    logger.error('Presence ping failed', { error: error.message });
    res.status(500).json({ error: 'Failed to update presence' });
  }
});

/**
 * Get online responders
 */
router.get('/responders/online', async (req, res) => {
  try {
    const onlineThreshold = new Date(Date.now() - 90000); // 90 seconds
    
    const responders = await Responder.find({
      lastSeen: { $gte: onlineThreshold },
      isActive: true
    }).select('name organization categoriesHandled status lastSeen currentCases whatsappNumber');
    
    const maskedResponders = responders.map(r => {
      const obj = r.toObject();
      obj.maskedPhone = maskPhoneNumber(obj.whatsappNumber);
      delete obj.whatsappNumber;
      obj.currentCasesCount = obj.currentCases?.length || 0;
      delete obj.currentCases;
      return obj;
    });
    
    res.json(maskedResponders);
  } catch (error) {
    logger.error('Failed to fetch online responders', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch responders' });
  }
});

/**
 * Get all responders with filtering
 */
router.get('/responders', async (req, res) => {
  try {
    const { status, role } = req.query;
    const filter = { isActive: true };
    
    if (status) filter.status = status;
    if (role) filter.role = role;
    
    const responders = await Responder.find(filter)
      .populate('currentCases', 'caseId status priority')
      .sort({ name: 1 });
    
    const maskedResponders = responders.map(r => {
      const obj = r.toObject();
      obj.activeCases = obj.currentCases?.length || 0;
      if (req.user?.role !== 'ADMIN') {
        obj.maskedPhone = maskPhoneNumber(obj.whatsappNumber);
        delete obj.whatsappNumber;
      }
      return obj;
    });
    
    res.json({ responders: maskedResponders });
  } catch (error) {
    logger.error('Failed to fetch responders', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch responders' });
  }
});

/**
 * Get suggested responders for a case
 */
router.get('/cases/:id/suggested-responders', async (req, res) => {
  try {
    const report = await Report.findOne({ caseId: req.params.id });
    
    if (!report) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    const onlineThreshold = new Date(Date.now() - 90000);
    
    // Find responders matching category and online
    const responders = await Responder.find({
      categoriesHandled: report.category,
      status: 'online',
      lastSeen: { $gte: onlineThreshold },
      isActive: true
    }).populate('currentCases', 'caseId');
    
    // Filter by availability and compute distance
    const suggestions = responders
      .filter(r => r.currentCases.length < r.maxConcurrentCases)
      .map(r => {
        const obj = r.toObject();
        obj.availability = `${r.currentCases.length}/${r.maxConcurrentCases}`;
        obj.distance = null; // TODO: compute actual distance if coords available
        return obj;
      })
      .sort((a, b) => a.currentCases.length - b.currentCases.length);
    
    res.json(suggestions);
  } catch (error) {
    logger.error('Failed to fetch suggested responders', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

/**
 * Geofences - List
 */
router.get('/geofences', async (req, res) => {
  try {
    const geofences = await Geofence.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(geofences);
  } catch (error) {
    logger.error('Failed to fetch geofences', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch geofences' });
  }
});

/**
 * Geofences - Create (admin only)
 */
router.post('/geofences', requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, polygon, notifyOnEntry } = req.body;
    
    if (!name || !polygon || !polygon.coordinates) {
      return res.status(400).json({ error: 'Name and polygon coordinates required' });
    }
    
    const geofence = new Geofence({
      name,
      polygon: {
        type: 'Polygon',
        coordinates: polygon.coordinates
      },
      notifyOnEntry: notifyOnEntry !== false,
      createdBy: req.user.id
    });
    
    await geofence.save();
    
    await Audit.createLog({
      actorId: req.user.id,
      action: 'geofence_created',
      targetId: geofence._id.toString(),
      targetType: 'Geofence',
      details: { name },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(201).json(geofence);
  } catch (error) {
    logger.error('Failed to create geofence', { error: error.message });
    res.status(500).json({ error: 'Failed to create geofence' });
  }
});

/**
 * Dashboard stats
 */
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const [total, active, critical, resolved, allCases] = await Promise.all([
      Report.countDocuments({}),
      Report.countDocuments({ status: { $in: ['accepted', 'in_progress'] } }),
      Report.countDocuments({ priority: { $in: ['high', 'critical'] }, status: { $ne: 'resolved' } }),
      Report.countDocuments({ status: 'resolved' }),
      Report.find({ status: 'accepted', updatedAt: { $exists: true } })
        .select('createdAt updatedAt')
        .limit(100)
    ]);
    
    // Calculate average accept time
    let avgAcceptTime = 0;
    if (allCases.length > 0) {
      const acceptTimes = allCases
        .filter(c => c.updatedAt && c.createdAt)
        .map(c => (c.updatedAt - c.createdAt) / 1000 / 60); // minutes
      
      if (acceptTimes.length > 0) {
        avgAcceptTime = Math.round(acceptTimes.reduce((a, b) => a + b, 0) / acceptTimes.length);
      }
    }
    
    res.json({
      total,
      active,
      critical,
      resolved,
      avgAcceptTime
    });
  } catch (error) {
    logger.error('Failed to fetch stats', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
