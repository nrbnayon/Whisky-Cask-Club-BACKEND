import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { aboutServices } from './aboutUs.service';

const createAbout = catchAsync(async (req, res) => {
  const result = await aboutServices.createAbout(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'about created succefully',
    data: result,
  });
});
const getAllAbout = catchAsync(async (req, res) => {
  const result = await aboutServices.getAllAbouts();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'about retrieve succefully',
    data: result,
  });
});

const updateAbout = catchAsync(async (req, res) => {
  const result = await aboutServices.updateAbout(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'about updated succefully',
    data: result,
  });
});

export const aboutControllers = {
  createAbout,
  updateAbout,
  getAllAbout,
};
