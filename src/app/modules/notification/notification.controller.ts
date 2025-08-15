// src/app/modules/notification/notification.controller.ts
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { notificationService } from './notification.service';

const getUserNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id || req.user?.userId;
  const filter = {
    type: req.query.type as string,
    isRead: req.query.isRead ? req.query.isRead === 'true' : undefined,
    priority: req.query.priority as string,
    startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
    endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await notificationService.getUserNotifications(userId, filter);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notifications retrieved successfully',
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id || req.user?.userId;
  const { id } = req.params;

  const result = await notificationService.markAsRead(id, userId);

  if (!result) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.NOT_FOUND,
      message: 'Notification not found',
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification marked as read',
    data: result,
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id || req.user?.userId;
  const count = await notificationService.markAllAsRead(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: `${count} notifications marked as read`,
    data: { count },
  });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id || req.user?.userId;
  const { id } = req.params;

  const success = await notificationService.deleteNotification(id, userId);

  if (!success) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.NOT_FOUND,
      message: 'Notification not found',
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification deleted successfully',
  });
});

const deleteAllNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id || req.user?.userId;
  const count = await notificationService.deleteAllNotifications(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: `${count} notifications deleted`,
    data: { count },
  });
});

const registerDeviceToken = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id || req.user?.userId;
  const { token, platform } = req.body;

  await notificationService.registerDeviceToken(userId, token, platform);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Device token registered successfully',
  });
});

const unregisterDeviceToken = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id || req.user?.userId;
  const { token } = req.body;

  await notificationService.unregisterDeviceToken(userId, token);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Device token unregistered successfully',
  });
});

const sendBulkNotifications = catchAsync(async (req: Request, res: Response) => {
  const { userIds, title, message, type, data, priority, sendPush } = req.body;

  await notificationService.sendBulkNotifications(userIds, title, message, type, {
    data,
    priority,
    sendPush,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Bulk notifications sent successfully',
  });
});

const getNotificationStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const result = await notificationService.getNotificationStats(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification statistics retrieved successfully',
    data: result,
  });
});

export const NotificationController = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  registerDeviceToken,
  unregisterDeviceToken,
  sendBulkNotifications,
  getNotificationStats,
};