import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { NewsLetterService } from './newsLetter.services';

const createNewsLetter = catchAsync(async (req, res) => {
  const result = await NewsLetterService.createNewsLetter(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Newsletter subscription successfully',
    data: result,
  });
});

const getAllNewsLetters = catchAsync(async (req, res) => {
  const result = await NewsLetterService.getAllNewsLetters(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All newsletters retrieved successfully',
    data: result,
  });
});

export const NewsLetterController = {
  createNewsLetter,
  getAllNewsLetters,
};
