/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { NextFunction, Request, Response } from 'express';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
const router = express.Router();

router.post(
  '/create-user',
  validateRequest(UserValidation.createUserSchema),
  UserController.createUser,
);

router.get('/all-user', UserController.getAllUser);

router.post(
  '/update-profile',
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(UserValidation.updateUserProfileSchema),
  UserController.updateProfile,
);

router.get('/user', UserController.getUserProfile);

router.get('/get-single-user/:id', UserController.getSingleUser);

// get user by search by phone
router.get('/user-search', UserController.searchByPhone);

router.get('/profile', UserController.getUserProfile);

export const UserRoutes = router;
