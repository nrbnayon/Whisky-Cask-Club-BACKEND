import cron from 'node-cron';
import { logger } from '../shared/logger';
import { SubscriptionService } from 'app/modules/subscription/subscription.service';

// Run every day at midnight
export const startSubscriptionCron = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Starting subscription expiry check...');
      await SubscriptionService.processExpiredSubscriptions();
      logger.info('Subscription expiry check completed');
    } catch (error) {
      logger.error('Error in subscription cron job:', error);
    }
  });

  logger.info('Subscription cron job scheduled');
};
