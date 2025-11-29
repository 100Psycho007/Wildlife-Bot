const express = require('express');
const Report = require('../models/Report');
const Responder = require('../models/Responder');
const User = require('../models/User');
const routingService = require('../services/routingService');
const logger = require('../utils/logger');

const router = express.Router();

// Get all reports with filtering and pagination
router.get('/reports', async (req, res) => {
  try {
    const { 
      status, 
      category, 
      priority, 
      page = 1, 
      limit = 20,
      startDate,
      endDate 
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    
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

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Failed to fetch reports', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get single report by case ID
router.get('/reports/:caseId', async (req, res) => {
  try {
    const report = await Report.findOne({ caseId: req.params.caseId })
      .populate('reporterId', 'whatsappNumber name contactInfo')
      .populate('assignedResponder', 'name organization contactInfo');

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    logger.error('Failed to fetch report', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Accept a case (for web dashboard)
router.post('/reports/:caseId/accept', async (req, res) => {
  try {
    const { responderId } = req.body;
    
    if (!responderId) {
      return res.status(400).json({ error: 'Responder ID is required' });
    }

    const responder = await Responder.findById(responderId);
    if (!responder) {
      return res.status(404).json({ error: 'Responder not found' });
    }

    await routingService.acceptCase(req.params.caseId, responder.whatsappNumber);
    
    const updatedReport = await Report.findOne({ caseId: req.params.caseId })
      .populate('assignedResponder');

    res.json(updatedReport);
  } catch (error) {
    logger.error('Failed to accept case', { error: error.message });
    res.status(400).json({ error: error.message });
  }
});

// Resolve a case (for web dashboard)
router.post('/reports/:caseId/resolve', async (req, res) => {
  try {
    const { responderId, resolution } = req.body;
    
    if (!responderId) {
      return res.status(400).json({ error: 'Responder ID is required' });
    }

    const responder = await Responder.findById(responderId);
    if (!responder) {
      return res.status(404).json({ error: 'Responder not found' });
    }

    await routingService.resolveCase(req.params.caseId, responder.whatsappNumber, resolution);
    
    const updatedReport = await Report.findOne({ caseId: req.params.caseId })
      .populate('assignedResponder');

    res.json(updatedReport);
  } catch (error) {
    logger.error('Failed to resolve case', { error: error.message });
    res.status(400).json({ error: error.message });
  }
});

// Get all responders
router.get('/responders', async (req, res) => {
  try {
    const responders = await Responder.find({ isActive: true })
      .select('-__v')
      .sort({ name: 1 });

    res.json(responders);
  } catch (error) {
    logger.error('Failed to fetch responders', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch responders' });
  }
});

// Create new responder
router.post('/responders', async (req, res) => {
  try {
    const responder = new Responder(req.body);
    await responder.save();
    
    logger.info('New responder created', { 
      responderId: responder._id, 
      name: responder.name 
    });
    
    res.status(201).json(responder);
  } catch (error) {
    logger.error('Failed to create responder', { error: error.message });
    res.status(400).json({ error: error.message });
  }
});

// Update responder status
router.patch('/responders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['online', 'offline', 'busy'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const responder = await Responder.findByIdAndUpdate(
      req.params.id,
      { status, lastSeen: new Date() },
      { new: true }
    );

    if (!responder) {
      return res.status(404).json({ error: 'Responder not found' });
    }

    res.json(responder);
  } catch (error) {
    logger.error('Failed to update responder status', { error: error.message });
    res.status(500).json({ error: 'Failed to update responder status' });
  }
});

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Promise.all([
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'accepted' }),
      Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ priority: 'critical' }),
      Responder.countDocuments({ status: 'online' }),
      Responder.countDocuments({ status: 'busy' })
    ]);

    res.json({
      pendingReports: stats[0],
      acceptedReports: stats[1],
      resolvedReports: stats[2],
      criticalReports: stats[3],
      onlineResponders: stats[4],
      busyResponders: stats[5],
      totalReports: stats[0] + stats[1] + stats[2]
    });
  } catch (error) {
    logger.error('Failed to fetch stats', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;