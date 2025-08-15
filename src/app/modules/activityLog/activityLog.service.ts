// src/app/modules/activityLog/activityLog.service.ts
import { Request } from 'express';
import { ActivityLog } from './activityLog.model';
import { IActivityLog, IActivityLogFilter } from './activityLog.interface';
import { redisClient } from '../../../config/redis.config';
import { logger } from '../../../shared/logger';

class ActivityLogService {
  /**
   * Log user activity
   */
  async logActivity(
    userId: string,
    action: string,
    resource: string,
    details: Record<string, any> = {},
    req?: Request,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const activityData = {
        user: userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown',
        userAgent: req?.get('User-Agent') || 'unknown',
        timestamp: new Date(),
        metadata: metadata || {},
      };

      // Save to MongoDB
      await ActivityLog.create(activityData);

      // Also track in Redis for real-time features
      await redisClient.trackUserActivity(userId, action, {
        resource,
        resourceId,
        details,
        ipAddress: activityData.ipAddress,
        userAgent: activityData.userAgent,
        metadata,
      });

      logger.info(`Activity logged: ${action} by user ${userId}`);
    } catch (error) {
      logger.error('Error logging activity:', error);
    }
  }

  /**
   * Get user activities with pagination
   */
  async getUserActivities(
    userId: string,
    filter: IActivityLogFilter = {}
  ): Promise<{
    activities: IActivityLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      action,
      resource,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filter;

    const query: any = { user: userId };

    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'fullName email')
        .lean(),
      ActivityLog.countDocuments(query),
    ]);

    return {
      activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all activities (Admin only)
   */
  async getAllActivities(
    filter: IActivityLogFilter = {}
  ): Promise<{
    activities: IActivityLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      user,
      action,
      resource,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filter;

    const query: any = {};

    if (user) query.user = user;
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'fullName email role')
        .lean(),
      ActivityLog.countDocuments(query),
    ]);

    return {
      activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(userId?: string): Promise<any> {
    const matchStage = userId ? { $match: { user: userId } } : { $match: {} };

    const stats = await ActivityLog.aggregate([
      matchStage,
      {
        $group: {
          _id: {
            action: '$action',
            resource: '$resource',
          },
          count: { $sum: 1 },
          lastActivity: { $max: '$timestamp' },
        },
      },
      {
        $group: {
          _id: '$_id.resource',
          actions: {
            $push: {
              action: '$_id.action',
              count: '$count',
              lastActivity: '$lastActivity',
            },
          },
          totalCount: { $sum: '$count' },
        },
      },
      {
        $sort: { totalCount: -1 },
      },
    ]);

    // Get daily activity for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: thirtyDaysAgo },
          ...(userId && { user: userId }),
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return {
      resourceStats: stats,
      dailyStats,
    };
  }

  /**
   * Delete old activities (cleanup job)
   */
  async cleanupOldActivities(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await ActivityLog.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    logger.info(`Cleaned up ${result.deletedCount} old activity logs`);
    return result.deletedCount;
  }
}

export const activityLogService = new ActivityLogService();