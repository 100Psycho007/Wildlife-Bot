const cron = require('node-cron');
const routingService = require('../services/routingService');
const logger = require('../utils/logger');

class Scheduler {
  constructor() {
    this.jobs = [];
  }

  start() {
    // Check for timeout cases every hour
    const timeoutJob = cron.schedule('0 * * * *', async () => {
      try {
        logger.info('Running timeout case check');
        await routingService.checkTimeoutCases();
      } catch (error) {
        logger.error('Error in timeout case check job', { error: error.message });
      }
    }, {
      scheduled: false
    });

    // Clean up old notifications every day at 2 AM
    const cleanupJob = cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('Running notification cleanup');
        await this.cleanupOldNotifications();
      } catch (error) {
        logger.error('Error in cleanup job', { error: error.message });
      }
    }, {
      scheduled: false
    });

    // Update responder last seen status every 5 minutes
    const responderStatusJob = cron.schedule('*/5 * * * *', async () => {
      try {
        logger.info('Updating responder status');
        await this.updateResponderStatus();
      } catch (error) {
        logger.error('Error in responder status job', { error: error.message });
      }
    }, {
      scheduled: false
    });

    this.jobs = [timeoutJob, cleanupJob, responderStatusJob];

    // Start all jobs
    this.jobs.forEach(job => job.start());
    
    logger.info('Scheduler started with all jobs');
  }

  stop() {
    this.jobs.forEach(job => job.stop());
    logger.info('Scheduler stopped');
  }

  async cleanupOldNotifications() {
    try {
      const Notification = require('../models/Notification');
      
      // Delete notifications older than 30 days
      const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
      
      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        status: { $in: ['sent', 'delivered', 'failed'] }
      });

      logger.info('Cleaned up old notifications', { deletedCount: result.deletedCount });
    } catch (error) {
      logger.error('Failed to cleanup notifications', { error: error.message });
    }
  }

  async updateResponderStatus() {
    try {
      const Responder = require('../models/Responder');
      
      // Mark responders as offline if they haven't been seen for more than 30 minutes
      const thirtyMinutesAgo = new Date(Date.now() - (30 * 60 * 1000));
      
      const result = await Responder.updateMany(
        {
          status: { $in: ['online', 'busy'] },
          lastSeen: { $lt: thirtyMinutesAgo }
        },
        {
          status: 'offline'
        }
      );

      if (result.modifiedCount > 0) {
        logger.info('Updated offline responder status', { count: result.modifiedCount });
      }
    } catch (error) {
      logger.error('Failed to update responder status', { error: error.message });
    }
  }
}

module.exports = new Scheduler();