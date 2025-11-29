const Report = require('../models/Report');
const Escalation = require('../models/Escalation');
const User = require('../models/User');
const Responder = require('../models/Responder');
const logger = require('../utils/logger');
const notificationService = require('../services/notification');

const ESCALATION_THRESHOLD = parseInt(process.env.ESCALATION_THRESHOLD_MINUTES || '20') * 60 * 1000;

async function checkEscalations() {
  try {
    const threshold = new Date(Date.now() - ESCALATION_THRESHOLD);
    
    // Find pending cases older than threshold
    const pendingCases = await Report.find({
      status: 'pending',
      createdAt: { $lt: threshold }
    });
    
    logger.info(`Checking escalations: ${pendingCases.length} cases found`);
    
    for (const report of pendingCases) {
      // Check if already escalated
      const existingEscalation = await Escalation.findOne({
        reportId: report._id,
        resolved: false
      });
      
      if (existingEscalation) {
        // Retry if needed
        if (existingEscalation.retryCount < 2) {
          await retryEscalation(existingEscalation, report);
        }
        continue;
      }
      
      // Create new escalation
      await createEscalation(report, 'timeout');
    }
  } catch (error) {
    logger.error('Escalation check failed', { error: error.message });
  }
}

async function createEscalation(report, reason) {
  try {
    const escalation = new Escalation({
      caseId: report.caseId,
      reportId: report._id,
      reason,
      escalatedAt: new Date()
    });
    
    // Find admins and on-call responders
    const admins = await User.find({ role: 'ADMIN', isActive: true });
    const responders = await Responder.find({
      categoriesHandled: report.category,
      isActive: true,
      status: { $in: ['online', 'offline'] }
    }).limit(5);
    
    const notifiedUsers = [];
    
    // Notify admins
    for (const admin of admins) {
      const result = await notificationService.sendEscalation(admin, report);
      notifiedUsers.push({
        userId: admin._id,
        notifiedAt: new Date(),
        method: result.method,
        status: result.success ? 'sent' : 'failed'
      });
    }
    
    // Notify responders
    for (const responder of responders) {
      const result = await notificationService.sendEscalation(responder, report);
      notifiedUsers.push({
        userId: responder._id,
        notifiedAt: new Date(),
        method: result.method,
        status: result.success ? 'sent' : 'failed'
      });
    }
    
    escalation.notifiedUsers = notifiedUsers;
    await escalation.save();
    
    // Add timeline entry
    await report.addTimelineEntry('escalated', 'System', `Case escalated due to ${reason}`);
    
    logger.info('Escalation created', { caseId: report.caseId, reason });
    
    return escalation;
  } catch (error) {
    logger.error('Failed to create escalation', { error: error.message, caseId: report.caseId });
    throw error;
  }
}

async function retryEscalation(escalation, report) {
  try {
    escalation.retryCount += 1;
    
    // Retry failed notifications
    const failedNotifications = escalation.notifiedUsers.filter(n => n.status === 'failed');
    
    for (const notification of failedNotifications) {
      const user = await User.findById(notification.userId);
      if (user) {
        const result = await notificationService.sendEscalation(user, report);
        notification.status = result.success ? 'sent' : 'failed';
        notification.notifiedAt = new Date();
      }
    }
    
    await escalation.save();
    
    logger.info('Escalation retry completed', { 
      caseId: report.caseId, 
      retryCount: escalation.retryCount 
    });
  } catch (error) {
    logger.error('Escalation retry failed', { error: error.message });
  }
}

async function sendDailyDigest() {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const stats = {
      newCases: await Report.countDocuments({ createdAt: { $gte: yesterday } }),
      resolvedCases: await Report.countDocuments({ 
        status: 'resolved', 
        updatedAt: { $gte: yesterday } 
      }),
      pendingCases: await Report.countDocuments({ status: 'pending' }),
      escalations: await Escalation.countDocuments({ escalatedAt: { $gte: yesterday } })
    };
    
    const admins = await User.find({ role: 'ADMIN', isActive: true });
    
    for (const admin of admins) {
      await notificationService.sendDailyDigest(admin, stats);
    }
    
    logger.info('Daily digest sent', { stats });
  } catch (error) {
    logger.error('Daily digest failed', { error: error.message });
  }
}

module.exports = {
  checkEscalations,
  createEscalation,
  sendDailyDigest
};
