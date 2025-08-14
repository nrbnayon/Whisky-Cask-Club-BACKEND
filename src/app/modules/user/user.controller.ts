// src/app/modules/user/user.controller.ts
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';

const createUser = catchAsync(async (req: Request, res: Response) => {
  await UserService.createUserFromDb(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Please check your email to verify your account.',
  });
});

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getMe(req.user.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateProfile(req.user, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile updated successfully',
    data: result,
  });
});

const updateProfileImage = catchAsync(async (req: Request, res: Response) => {
  let imagePath: string | undefined;

  if (req.files && 'image' in req.files && req.files.image[0]) {
    imagePath = `/images/${req.files.image[0].filename}`;
  }

  if (!imagePath) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Profile image is required',
    });
  }

  const result = await UserService.updateProfileImage(req.user.id, imagePath);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile image updated successfully',
    data: result,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getSingleUser(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User retrieved successfully',
    data: result,
  });
});

const searchByPhone = catchAsync(async (req: Request, res: Response) => {
  const { searchTerm } = req.query;
  const result = await UserService.searchUserByPhone(
    searchTerm as string,
    req.user.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users found by search',
    data: result,
  });
});

const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  const userIdToDelete = req.params.id || req.user.id;
  const result = await UserService.deleteUserAccount(
    userIdToDelete,
    req.user.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
  });
});

const adminUpdateUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.adminUpdateUser(
    req.user.id,
    req.params.id,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User updated successfully',
    data: result,
  });
});

const changeUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const result = await UserService.changeUserStatus(
    req.user.id,
    req.params.id,
    status,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User status updated successfully',
    data: result,
  });
});

export const UserController = {
  createUser,
  getAllUser,
  getMe,
  updateProfile,
  updateProfileImage,
  getSingleUser,
  searchByPhone,
  deleteAccount,
  adminUpdateUser,
  changeUserStatus,
};
