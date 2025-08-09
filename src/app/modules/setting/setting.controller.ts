/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import { settingServices } from './setting.service';

const createSetting = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await settingServices.createSetting(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'setting created succefully',
      data: result,
    });
  },
);
const getAllSetting = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await settingServices.getAllSetting();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'setting retrieve succefully',
      data: result,
    });
  },
);

const updateSetting = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await settingServices.updateSetting(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'setting updated succefully',
      data: result,
    });
  },
);

export const settingControllers = {
  createSetting,
  updateSetting,
  getAllSetting,
};
