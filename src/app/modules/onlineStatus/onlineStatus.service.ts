// src/app/modules/onlineStatus/onlineStatus.service.ts
import { User } from '../user/user.model';
import { redisClient } from '../../../config/redis.config';
import { logger } from '../../../shared/logger';
import { io } from '../../../socket/socket';

class OnlineStatusService {
  /**
   * Set user online
   */
  async setUserOnline(userId: string): Promise<void> {
    try {
      // Update in Redis
      await redisClient.setUserOnline(userId);

      // Update in MongoDB
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date(),
      });

      // Broadcast to all connected clients
      if (io) {
        io.emit('user:online', { userId, isOnline: true, lastSeen: new Date() });
      }

      logger.info(`User ${userId} is now online`);
    } catch (error) {
      logger.error(`Error setting user ${userId} online:`, error);
    }
  }

  /**
   * Set user offline
   */
  async setUserOffline(userId: string): Promise<void> {
    try {
      const lastSeen = new Date();

      // Update in Redis
      await redisClient.setUserOffline(userId);

      // Update in MongoDB
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen,
      });

      // Broadcast to all connected clients
      if (io) {
        io.emit('user:offline', { userId, isOnline: false, lastSeen });
      }

      logger.info(`User ${userId} is now offline`);
    } catch (error) {
      logger.error(`Error setting user ${userId} offline:`, error);
    }
  }

  /**
   * Check if user is online
   */
  async isUserOnline(userId: string): Promise<boolean> {
    try {
      // Check Redis first (faster)
      const isOnlineRedis = await redisClient.isUserOnline(userId);
      if (isOnlineRedis) {
        return true;
      }

      // Fallback to MongoDB
      const user = await User.findById(userId).select('isOnline lastSeen');
      if (!user) {
        return false;
      }

      // Consider user offline if last seen was more than 5 minutes ago
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return user.isOnline && user.lastSeen > fiveMinutesAgo;
    } catch (error) {
      logger.error(`Error checking online status for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get all online users
   */
  async getOnlineUsers(): Promise<string[]> {
    try {
      return await redisClient.getOnlineUsers();
    } catch (error) {
      logger.error('Error getting online users:', error);
      return [];
    }
  }

  /**
   * Get online users count
   */
  async getOnlineUsersCount(): Promise<number> {
    try {
      return await redisClient.getOnlineUsersCount();
    } catch (error) {
      logger.error('Error getting online users count:', error);
      return 0;
    }
  }

  /**
   * Get user's last seen
   */
  async getUserLastSeen(userId: string): Promise<Date | null> {
    try {
      const user = await User.findById(userId).select('lastSeen');
      return user?.lastSeen || null;
    } catch (error) {
      logger.error(`Error getting last seen for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get online users with details
   */
  async getOnlineUsersWithDetails(): Promise<any[]> {
    try {
      const onlineUserIds = await this.getOnlineUsers();
      if (onlineUserIds.length === 0) {
        return [];
      }

      const users = await User.find({
        _id: { $in: onlineUserIds },
        isDeleted: false,
      })
        .select('fullName email image isOnline lastSeen')
        .lean();

      return users;
    } catch (error) {
      logger.error('Error getting online users with details:', error);
      return [];
    }
  }

  /**
   * Update user activity (heartbeat)
   */
  async updateUserActivity(userId: string): Promise<void> {
    try {
      const now = new Date();
      
      // Update Redis
      await redisClient.setUserOnline(userId);
      
      // Update MongoDB (less frequently to reduce DB load)
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: now,
      });

      logger.debug(`Updated activity for user ${userId}`);
    } catch (error) {
      logger.error(`Error updating activity for user ${userId}:`, error);
    }
  }

  /**
   * Cleanup offline users (run periodically)
   */
  async cleanupOfflineUsers(): Promise<void> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      // Find users who haven't been seen in 5 minutes
      const offlineUsers = await User.find({
        isOnline: true,
        lastSeen: { $lt: fiveMinutesAgo },
      }).select('_id');

      for (const user of offlineUsers) {
        await this.setUserOffline(user._id.toString());
      }

      if (offlineUsers.length > 0) {
        logger.info(`Cleaned up ${offlineUsers.length} offline users`);
      }
    } catch (error) {
      logger.error('Error cleaning up offline users:', error);
    }
  }
}

export const onlineStatusService = new OnlineStatusService();