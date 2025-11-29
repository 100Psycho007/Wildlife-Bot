const Responder = require('../models/Responder');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const whatsappService = require('./whatsappService');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

class RoutingService {
  async routeReport(report) {
    try {
      logger.info('Starting report routing', { 
        caseId: report.caseId, 
        category: report.category, 
        priority: report.priority 
      });

      // For high-priority cases, notify all available responders immediately
      if (report.priority === 'critical' || report.priority === 'high') {
        await this.handleHighPriorityCase(report);
      } else {
        await this.handleNormalPriorityCase(report);
      }

      // Create notification records
      await this.createNotificationRecords(report);

    } catch (error) {
      logger.error('Failed to route report', {
        caseId: report.caseId,
        error: error.message
      });
      throw error;
    }
  }

  async handleHighPriorityCase(report) {
    // For high-priority cases, notify ALL available responders regardless of category
    const availableResponders = await Responder.find({
      isActive: true,
      status: { $in: ['online', 'busy'] } // Include busy responders for critical cases
    });

    logger.info(`Found ${availableResponders.length} responders for high-priority case`, {
      caseId: report.caseId
    });

    const notificationPromises = availableResponders.map(responder => 
      this.notifyResponder(responder, report)
    );

    await Promise.allSettled(notificationPromises);
  }

  async handleNormalPriorityCase(report) {
    // Find responders who handle this category and are available
    const matchedResponders = await Responder.find({
      isActive: true,
      status: 'online',
      categoriesHandled: report.category,
      $expr: { $lt: [{ $size: '$currentCases' }, '$maxConcurrentCases'] }
    });

    logger.info(`Found ${matchedResponders.length} matched responders for normal case`, {
      caseId: report.caseId,
      category: report.category
    });

    if (matchedResponders.length === 0) {
      // No available responders, try to find any online responders
      const anyAvailableResponders = await Responder.find({
        isActive: true,
        status: 'online',
        $expr: { $lt: [{ $size: '$currentCases' }, '$maxConcurrentCases'] }
      });

      if (anyAvailableResponders.length > 0) {
        logger.info(`No category-specific responders, notifying ${anyAvailableResponders.length} general responders`);
        const notificationPromises = anyAvailableResponders.map(responder => 
          this.notifyResponder(responder, report)
        );
        await Promise.allSettled(notificationPromises);
      } else {
        logger.warn('No available responders found', { caseId: report.caseId });
      }
    } else {
      const notificationPromises = matchedResponders.map(responder => 
        this.notifyResponder(responder, report)
      );
      await Promise.allSettled(notificationPromises);
    }
  }

  async notifyResponder(responder, report) {
    try {
      await whatsappService.sendResponderNotification(
        responder.whatsappNumber, 
        report
      );

      logger.info('Responder notified successfully', {
        caseId: report.caseId,
        responderId: responder._id,
        responderName: responder.name
      });

      return true;
    } catch (error) {
      logger.error('Failed to notify responder', {
        caseId: report.caseId,
        responderId: responder._id,
        error: error.message
      });
      return false;
    }
  }

  async acceptCase(caseId, responderWhatsApp) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Find the report and responder
        const report = await Report.findOne({ caseId }).session(session);
        const responder = await Responder.findOne({ whatsappNumber: responderWhatsApp }).session(session);

        if (!report) {
          throw new Error('Case not found');
        }

        if (!responder) {
          throw new Error('Responder not found');
        }

        if (report.status !== 'pending') {
          throw new Error('Case already accepted by another responder');
        }

        if (!responder.canAcceptCase()) {
          throw new Error('Responder cannot accept more cases');
        }

        // Atomically assign the case
        await Report.updateOne(
          { _id: report._id, status: 'pending' },
          { 
            status: 'accepted',
            assignedResponder: responder._id,
            assignedOrganization: responder.organization,
            $push: {
              timeline: {
                action: 'accepted',
                performedBy: responder.name,
                details: 'Case accepted by responder',
                timestamp: new Date()
              }
            }
          }
        ).session(session);

        // Update responder status
        await responder.acceptCase(report._id);

        logger.info('Case accepted successfully', {
          caseId,
          responderId: responder._id,
          responderName: responder.name
        });

        // Notify the original reporter
        const reporterUser = await require('../models/User').findById(report.reporterId);
        if (reporterUser) {
          await whatsappService.sendCaseAccepted(
            reporterUser.whatsappNumber,
            caseId,
            responder.name,
            responder.contactInfo.phone || responder.whatsappNumber
          );
        }

        return { report, responder };
      });

    } catch (error) {
      logger.error('Failed to accept case', {
        caseId,
        responderWhatsApp,
        error: error.message
      });
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async resolveCase(caseId, responderWhatsApp, resolution = '') {
    try {
      const report = await Report.findOne({ caseId });
      const responder = await Responder.findOne({ whatsappNumber: responderWhatsApp });

      if (!report || !responder) {
        throw new Error('Case or responder not found');
      }

      if (!report.assignedResponder.equals(responder._id)) {
        throw new Error('Only assigned responder can resolve this case');
      }

      // Update report status
      report.status = 'resolved';
      await report.addTimelineEntry('resolved', responder.name, resolution);

      // Update responder availability
      await responder.completeCase(report._id);

      // Notify the original reporter
      const reporterUser = await require('../models/User').findById(report.reporterId);
      if (reporterUser) {
        await whatsappService.sendCaseResolved(reporterUser.whatsappNumber, caseId);
      }

      logger.info('Case resolved successfully', {
        caseId,
        responderId: responder._id,
        resolution
      });

      return report;
    } catch (error) {
      logger.error('Failed to resolve case', {
        caseId,
        responderWhatsApp,
        error: error.message
      });
      throw error;
    }
  }

  async createNotificationRecords(report) {
    try {
      // Create notification record for case creation
      const notification = new Notification({
        reportId: report._id,
        recipientId: report.reporterId,
        recipientType: 'user',
        type: 'case_created',
        message: `Your wildlife report ${report.caseId} has been submitted and is being processed.`,
        status: 'sent'
      });

      await notification.save();
    } catch (error) {
      logger.error('Failed to create notification records', {
        caseId: report.caseId,
        error: error.message
      });
    }
  }

  async checkTimeoutCases() {
    try {
      const timeoutHours = parseInt(process.env.CASE_TIMEOUT_HOURS) || 24;
      const timeoutDate = new Date(Date.now() - (timeoutHours * 60 * 60 * 1000));

      const timeoutCases = await Report.find({
        status: 'pending',
        createdAt: { $lt: timeoutDate }
      }).populate('reporterId');

      for (const report of timeoutCases) {
        if (report.reporterId && report.reporterId.whatsappNumber) {
          await whatsappService.sendCaseTimeout(
            report.reporterId.whatsappNumber,
            report.caseId
          );

          // Create timeout notification record
          const notification = new Notification({
            reportId: report._id,
            recipientId: report.reporterId._id,
            recipientType: 'user',
            type: 'case_timeout',
            message: `Your case ${report.caseId} is still pending assignment after ${timeoutHours} hours.`,
            status: 'sent'
          });

          await notification.save();
        }
      }

      logger.info(`Processed ${timeoutCases.length} timeout cases`);
    } catch (error) {
      logger.error('Failed to check timeout cases', { error: error.message });
    }
  }
}

module.exports = new RoutingService();