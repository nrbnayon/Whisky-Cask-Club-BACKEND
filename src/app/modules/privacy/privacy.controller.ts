import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { privacyServices } from './privacy.service';

const createPrivacy = catchAsync(async (req, res) => {
  const result = await privacyServices.createPrivacy(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'privacy created succefully',
    data: result,
  });
});
const getAllPrivacy = catchAsync(async (req, res) => {
  const result = await privacyServices.getAllPrivacy();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'privacy retrieve succefully',
    data: result,
  });
});

const updatePrivacy = catchAsync(async (req, res) => {
  const result = await privacyServices.updatePrivacy(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'privacy updated succefully',
    data: result,
  });
});

export const privacyControllers = {
  createPrivacy,
  updatePrivacy,
  getAllPrivacy,
};
