// src/app/modules/onlineStatus/onlineStatus.controller.ts
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { onlineStatusService } from './onlineStatus.service';

const getOnlineUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await onlineStatusService.getOnlineUsersWithDetails();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Online users retrieved successfully',
    data: {
      users: result,
      count: result.length,
    },
  });
});

const getOnlineUsersCount = catchAsync(async (req: Request, res: Response) => {
  const count = await onlineStatusService.getOnlineUsersCount();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Online users count retrieved successfully',
    data: { count },
  });
});

const checkUserOnlineStatus = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const isOnline = await onlineStatusService.isUserOnline(userId);
  const lastSeen = await onlineStatusService.getUserLastSeen(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User online status retrieved successfully',
    data: {
      userId,
      isOnline,
      lastSeen,
    },
  });
});

const updateUserActivity = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id || req.user?.userId;
  await onlineStatusService.updateUserActivity(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User activity updated successfully',
  });
});

export const OnlineStatusController = {
  getOnlineUsers,
  getOnlineUsersCount,
  checkUserOnlineStatus,
  updateUserActivity,
};