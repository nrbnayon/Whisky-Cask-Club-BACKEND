// src/app/modules/notification/notification.service.ts
import { Types } from 'mongoose';
import { Notification } from './notification.model';
import { INotification, IPushNotification, INotificationFilter } from './notification.interface';
import { User } from '../user/user.model';
import { messaging } from '../../../config/firebase.config';
import { redisClient } from '../../../config/redis.config';
import { logger } from '../../../shared/logger';
import { io } from '../../../socket/socket';

class NotificationService {
  /**
   * Create and send notification
   */
  async createNotification(
    recipientId: string,
    title: string,
    message: string,
    type: INotification['type'] = 'INFO',
    options: {
      senderId?: string;
      data?: Record<string, any>;
      priority?: INotification['priority'];
      expiresAt?: Date;
      actionUrl?: string;
      imageUrl?: string;
      sendPush?: boolean;
      sendRealtime?: boolean;
    } = {}
  ): Promise<INotification> {
    const {
      senderId,
      data = {},
      priority = 'MEDIUM',
      expiresAt,
      actionUrl,
      imageUrl,
      sendPush = true,
      sendRealtime = true,
    } = options;

    // Create notification in database
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      title,
      message,
      type,
      data,
      priority,
      expiresAt,
      actionUrl,
      imageUrl,
    });

    // Populate sender info
    await notification.populate('sender', 'fullName email image');

    // Store in Redis for real-time access
    await redisClient.storeNotification(recipientId, {
      id: notification._id,
      title,
      message,
      type,
      priority,
      createdAt: notification.createdAt,
      data,
      actionUrl,
      imageUrl,
    });

    // Send real-time notification via Socket.IO
    if (sendRealtime) {
      this.sendRealtimeNotification(recipientId, notification);
    }

    // Send push notification
    if (sendPush && messaging) {
      await this.sendPushNotification(recipientId, {
        title,
        body: message,
        data,
        imageUrl,
        actionUrl,
      });
    }

    logger.info(`Notification created for user ${recipientId}: ${title}`);
    return notification;
  }

  /**
   * Send push notification via Firebase
   */
  async sendPushNotification(
    userId: string,
    notification: IPushNotification
  ): Promise<void> {
    if (!messaging) {
      logger.warn('Firebase messaging not initialized');
      return;
    }

    try {
      const user = await User.findById(userId).select('deviceTokens');
      if (!user || !user.deviceTokens || user.deviceTokens.length === 0) {
        logger.warn(`No device tokens found for user ${userId}`);
        return;
      }

      const tokens = user.deviceTokens.map(device => device.token);
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl }),
        },
        data: {
          ...notification.data,
          ...(notification.actionUrl && { actionUrl: notification.actionUrl }),
        },
        tokens,
      };

      const response = await messaging.sendMulticast(message);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            logger.warn(`Failed to send notification to token: ${tokens[idx]}, error: ${resp.error?.message}`);
          }
        });

        // Remove invalid tokens
        if (failedTokens.length > 0) {
          await User.findByIdAndUpdate(userId, {
            $pull: { deviceTokens: { token: { $in: failedTokens } } },
          });
        }
      }

      logger.info(`Push notification sent to ${response.successCount} devices for user ${userId}`);
    } catch (error) {
      logger.error(`Error sending push notification to user ${userId}:`, error);
    }
  }

  /**
   * Send real-time notification via Socket.IO
   */
  sendRealtimeNotification(userId: string, notification: INotification): void {
    try {
      if (io) {
        io.emit(`notification:${userId}`, {
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          data: notification.data,
          actionUrl: notification.actionUrl,
          imageUrl: notification.imageUrl,
          createdAt: notification.createdAt,
          sender: notification.sender,
        });
        logger.info(`Real-time notification sent to user ${userId}`);
      }
    } catch (error) {
      logger.error(`Error sending real-time notification to user ${userId}:`, error);
    }
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(
    userId: string,
    filter: INotificationFilter = {}
  ): Promise<{
    notifications: INotification[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      type,
      isRead,
      priority,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filter;

    const query: any = { recipient: userId };

    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead;
    if (priority) query.priority = priority;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'fullName email image')
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (notification) {
      logger.info(`Notification ${notificationId} marked as read by user ${userId}`);
    }

    return notification;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    logger.info(`${result.modifiedCount} notifications marked as read for user ${userId}`);
    return result.modifiedCount;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    if (result) {
      logger.info(`Notification ${notificationId} deleted by user ${userId}`);
      return true;
    }

    return false;
  }

  /**
   * Delete all notifications for user
   */
  async deleteAllNotifications(userId: string): Promise<number> {
    const result = await Notification.deleteMany({ recipient: userId });
    logger.info(`${result.deletedCount} notifications deleted for user ${userId}`);
    return result.deletedCount;
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    userIds: string[],
    title: string,
    message: string,
    type: INotification['type'] = 'INFO',
    options: {
      data?: Record<string, any>;
      priority?: INotification['priority'];
      sendPush?: boolean;
    } = {}
  ): Promise<void> {
    const { data = {}, priority = 'MEDIUM', sendPush = true } = options;

    // Create notifications in bulk
    const notifications = userIds.map(userId => ({
      recipient: userId,
      title,
      message,
      type,
      data,
      priority,
    }));

    await Notification.insertMany(notifications);

    // Send push notifications
    if (sendPush && messaging) {
      for (const userId of userIds) {
        await this.sendPushNotification(userId, {
          title,
          body: message,
          data,
        });
      }
    }

    logger.info(`Bulk notifications sent to ${userIds.length} users`);
  }

  /**
   * Register device token for push notifications
   */
  async registerDeviceToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web' = 'web'
  ): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          deviceTokens: {
            token,
            platform,
            createdAt: new Date(),
          },
        },
      },
      { upsert: true }
    );

    logger.info(`Device token registered for user ${userId}, platform: ${platform}`);
  }

  /**
   * Unregister device token
   */
  async unregisterDeviceToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { deviceTokens: { token } },
    });

    logger.info(`Device token unregistered for user ${userId}`);
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(): Promise<number> {
    const result = await Notification.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    logger.info(`Cleaned up ${result.deletedCount} expired notifications`);
    return result.deletedCount;
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId?: string): Promise<any> {
    const matchStage = userId ? { $match: { recipient: new Types.ObjectId(userId) } } : { $match: {} };

    const stats = await Notification.aggregate([
      matchStage,
      {
        $group: {
          _id: {
            type: '$type',
            isRead: '$isRead',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.type',
          read: {
            $sum: {
              $cond: [{ $eq: ['$_id.isRead', true] }, '$count', 0],
            },
          },
          unread: {
            $sum: {
              $cond: [{ $eq: ['$_id.isRead', false] }, '$count', 0],
            },
          },
          total: { $sum: '$count' },
        },
      },
    ]);

    return stats;
  }
}

export const notificationService = new NotificationService();