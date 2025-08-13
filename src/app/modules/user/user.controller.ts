import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const value = {
    ...req.body,
  };

  await UserService.createUserFromDb(value);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Please check your email to verify your account.',
  });
});

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'all user retrieved successfully',
    data: result,
  });
});

//get me
const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await UserService.getMe(userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  let image;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const value = {
    image,
    ...req.body,
  };

  const result = await UserService.updateProfileToDB(user, value);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getSingleUser(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User retrived successfully',
    data: result,
  });
});

// search by phone number
const searchByPhone = catchAsync(async (req: Request, res: Response) => {
  const searchTerm = req.query.searchTerm;
  const userId = req?.user?.id;

  const result = await UserService.searchUserByPhone(
    searchTerm as string,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'get user by searching phone number',
    data: result,
  });
});

export const UserController = {
  createUser,
  getUserProfile,
  getMe,
  updateProfile,
  searchByPhone,
  getSingleUser,
  getAllUser,
};
