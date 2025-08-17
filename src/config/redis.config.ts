// src/config/redis.config.ts
import Redis from 'ioredis';
import config from './index';
import { logger } from '../shared/logger';

class RedisClient {
  private client: Redis | null = null;
  private static instance: RedisClient;
  private isRedisEnabled: boolean;

  private constructor() {
    // Check if Redis should be enabled
    this.isRedisEnabled = process.env.DISABLE_REDIS !== 'true';

    if (!this.isRedisEnabled) {
      logger.info('Redis disabled for local development');
      return;
    }

    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      retryDelayOnClusterDown: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });

    this.client.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    this.client.on('error', error => {
      logger.error('Redis connection error:', error);
    });

    this.client.on('ready', () => {
      logger.info('Redis is ready to use');
    });

    this.client.on('close', () => {
      logger.warn('Redis connection closed');
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public getClient(): Redis | null {
    return this.client;
  }

  // User online status methods
  public async setUserOnline(userId: string): Promise<void> {
    if (!this.client) {
      logger.debug(`Redis disabled: Skipping setUserOnline for user ${userId}`);
      return;
    }

    try {
      await this.client.setex(
        `user:online:${userId}`,
        300,
        Date.now().toString(),
      ); // 5 minutes expiry
      await this.client.sadd('online_users', userId);
    } catch (error) {
      logger.error(`Error setting user ${userId} online:`, error);
    }
  }

  public async setUserOffline(userId: string): Promise<void> {
    if (!this.client) {
      logger.debug(
        `Redis disabled: Skipping setUserOffline for user ${userId}`,
      );
      return;
    }

    try {
      await this.client.del(`user:online:${userId}`);
      await this.client.srem('online_users', userId);
    } catch (error) {
      logger.error(`Error setting user ${userId} offline:`, error);
    }
  }

  public async isUserOnline(userId: string): Promise<boolean> {
    if (!this.client) {
      logger.debug(
        `Redis disabled: Returning false for isUserOnline check for user ${userId}`,
      );
      return false;
    }

    try {
      const result = await this.client.exists(`user:online:${userId}`);
      return result === 1;
    } catch (error) {
      logger.error(`Error checking online status for user ${userId}:`, error);
      return false;
    }
  }

  public async getOnlineUsers(): Promise<string[]> {
    if (!this.client) {
      logger.debug('Redis disabled: Returning empty array for getOnlineUsers');
      return [];
    }

    try {
      return await this.client.smembers('online_users');
    } catch (error) {
      logger.error('Error getting online users:', error);
      return [];
    }
  }

  public async getOnlineUsersCount(): Promise<number> {
    if (!this.client) {
      logger.debug('Redis disabled: Returning 0 for getOnlineUsersCount');
      return 0;
    }

    try {
      return await this.client.scard('online_users');
    } catch (error) {
      logger.error('Error getting online users count:', error);
      return 0;
    }
  }

  // Activity tracking methods
  public async trackUserActivity(
    userId: string,
    activity: string,
    metadata?: any,
  ): Promise<void> {
    if (!this.client) {
      logger.debug(
        `Redis disabled: Skipping trackUserActivity for user ${userId}`,
      );
      return;
    }

    try {
      const activityData = {
        userId,
        activity,
        timestamp: Date.now(),
        metadata: metadata || {},
      };

      await this.client.lpush(
        `user:activity:${userId}`,
        JSON.stringify(activityData),
      );
      await this.client.ltrim(`user:activity:${userId}`, 0, 99); // Keep last 100 activities

      // Global activity feed
      await this.client.lpush('global:activity', JSON.stringify(activityData));
      await this.client.ltrim('global:activity', 0, 999); // Keep last 1000 activities
    } catch (error) {
      logger.error(`Error tracking activity for user ${userId}:`, error);
    }
  }

  public async getUserActivities(
    userId: string,
    limit: number = 50,
  ): Promise<any[]> {
    if (!this.client) {
      logger.debug(
        `Redis disabled: Returning empty array for getUserActivities for user ${userId}`,
      );
      return [];
    }

    try {
      const activities = await this.client.lrange(
        `user:activity:${userId}`,
        0,
        limit - 1,
      );
      return activities.map(activity => JSON.parse(activity));
    } catch (error) {
      logger.error(`Error getting activities for user ${userId}:`, error);
      return [];
    }
  }

  public async getGlobalActivities(limit: number = 100): Promise<any[]> {
    if (!this.client) {
      logger.debug(
        'Redis disabled: Returning empty array for getGlobalActivities',
      );
      return [];
    }

    try {
      const activities = await this.client.lrange(
        'global:activity',
        0,
        limit - 1,
      );
      return activities.map(activity => JSON.parse(activity));
    } catch (error) {
      logger.error('Error getting global activities:', error);
      return [];
    }
  }

  // Notification methods
  public async storeNotification(
    userId: string,
    notification: any,
  ): Promise<void> {
    if (!this.client) {
      logger.debug(
        `Redis disabled: Skipping storeNotification for user ${userId}`,
      );
      return;
    }

    try {
      await this.client.lpush(
        `user:notifications:${userId}`,
        JSON.stringify(notification),
      );
      await this.client.ltrim(`user:notifications:${userId}`, 0, 99); // Keep last 100 notifications
    } catch (error) {
      logger.error(`Error storing notification for user ${userId}:`, error);
    }
  }

  public async getUserNotifications(
    userId: string,
    limit: number = 50,
  ): Promise<any[]> {
    if (!this.client) {
      logger.debug(
        `Redis disabled: Returning empty array for getUserNotifications for user ${userId}`,
      );
      return [];
    }

    try {
      const notifications = await this.client.lrange(
        `user:notifications:${userId}`,
        0,
        limit - 1,
      );
      return notifications.map(notification => JSON.parse(notification));
    } catch (error) {
      logger.error(`Error getting notifications for user ${userId}:`, error);
      return [];
    }
  }

  // Session management
  public async storeUserSession(
    userId: string,
    sessionData: any,
  ): Promise<void> {
    if (!this.client) {
      logger.debug(
        `Redis disabled: Skipping storeUserSession for user ${userId}`,
      );
      return;
    }

    try {
      await this.client.setex(
        `user:session:${userId}`,
        86400,
        JSON.stringify(sessionData),
      ); // 24 hours
    } catch (error) {
      logger.error(`Error storing session for user ${userId}:`, error);
    }
  }

  public async getUserSession(userId: string): Promise<any | null> {
    if (!this.client) {
      logger.debug(
        `Redis disabled: Returning null for getUserSession for user ${userId}`,
      );
      return null;
    }

    try {
      const session = await this.client.get(`user:session:${userId}`);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      logger.error(`Error getting session for user ${userId}:`, error);
      return null;
    }
  }

  public async deleteUserSession(userId: string): Promise<void> {
    if (!this.client) {
      logger.debug(
        `Redis disabled: Skipping deleteUserSession for user ${userId}`,
      );
      return;
    }

    try {
      await this.client.del(`user:session:${userId}`);
    } catch (error) {
      logger.error(`Error deleting session for user ${userId}:`, error);
    }
  }

  // Health check
  public async ping(): Promise<boolean> {
    if (!this.client) {
      logger.debug('Redis disabled: Returning false for ping');
      return false;
    }

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis ping failed:', error);
      return false;
    }
  }

  // Utility method to check if Redis is enabled
  public isEnabled(): boolean {
    return this.isRedisEnabled;
  }
}

export const redisClient = RedisClient.getInstance();
export default redisClient;
