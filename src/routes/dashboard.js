const express = require('express');
const Report = require('../models/Report');
const Responder = require('../models/Responder');
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

module.exports = router;
