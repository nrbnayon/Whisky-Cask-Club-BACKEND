// src/jobs/cleanupJobs.ts
import cron from 'node-cron';
import { logger } from '../shared/logger';
import { activityLogService } from '../app/modules/activityLog/activityLog.service';
import { notificationService } from '../app/modules/notification/notification.service';
import { onlineStatusService } from '../app/modules/onlineStatus/onlineStatus.service';

// Cleanup old activity logs - runs daily at 2 AM
export const startActivityLogCleanup = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Starting activity log cleanup...');
      await activityLogService.cleanupOldActivities(90); // Keep 90 days
      logger.info('Activity log cleanup completed');
    } catch (error) {
      logger.error('Error in activity log cleanup:', error);
    }
  });

  logger.info('Activity log cleanup job scheduled');
};

// Cleanup expired notifications - runs daily at 3 AM
export const startNotificationCleanup = () => {
  cron.schedule('0 3 * * *', async () => {
    try {
      logger.info('Starting notification cleanup...');
      await notificationService.cleanupExpiredNotifications();
      logger.info('Notification cleanup completed');
    } catch (error) {
      logger.error('Error in notification cleanup:', error);
    }
  });

  logger.info('Notification cleanup job scheduled');
};

// Cleanup offline users - runs every 5 minutes
export const startOfflineUserCleanup = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      await onlineStatusService.cleanupOfflineUsers();
    } catch (error) {
      logger.error('Error in offline user cleanup:', error);
    }
  });

  logger.info('Offline user cleanup job scheduled');
};

// Start all cleanup jobs
export const startAllCleanupJobs = () => {
  startActivityLogCleanup();
  startNotificationCleanup();
  startOfflineUserCleanup();
  logger.info('All cleanup jobs started');
};