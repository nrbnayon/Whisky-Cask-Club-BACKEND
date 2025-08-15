// src/app/modules/activityLog/activityLog.controller.ts
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { activityLogService } from './activityLog.service';

const getUserActivities = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id || req.user?.userId;
  const filter = {
    action: req.query.action as string,
    resource: req.query.resource as string,
    startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
    endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await activityLogService.getUserActivities(userId, filter);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User activities retrieved successfully',
    data: result,
  });
});

const getAllActivities = catchAsync(async (req: Request, res: Response) => {
  const filter = {
    user: req.query.user as string,
    action: req.query.action as string,
    resource: req.query.resource as string,
    startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
    endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 50,
  };

  const result = await activityLogService.getAllActivities(filter);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All activities retrieved successfully',
    data: result,
  });
});

const getActivityStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const result = await activityLogService.getActivityStats(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Activity statistics retrieved successfully',
    data: result,
  });
});

export const ActivityLogController = {
  getUserActivities,
  getAllActivities,
  getActivityStats,
};