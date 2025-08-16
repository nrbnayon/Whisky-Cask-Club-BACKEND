// src/app/modules/user/user.route.ts
import { Router } from 'express';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = Router();

// Public routes
router.post(
  '/sign-up',
  validateRequest(UserValidation.createUserSchema),
  UserController.createUser,
);

// User routes (authenticated)
router.get('/me', auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), UserController.getMe);

router.patch(
  '/profile-update',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),
  validateRequest(UserValidation.updateUserProfileSchema),
  UserController.updateProfile,
);

router.patch(
  '/profile-image',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),
  validateRequest(UserValidation.updateProfileImageSchema),
  UserController.updateProfileImage,
);

router.delete('/account', auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), UserController.deleteAccount);

router.get('/search', auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), UserController.searchByPhone);

// Admin routes
router.get(
  '/all',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserController.getAllUser,
);

router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserController.getSingleUser,
);

router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(UserValidation.adminUpdateUserSchema),
  UserController.adminUpdateUser,
);

router.patch(
  '/:id/status',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(UserValidation.changeUserStatusSchema),
  UserController.changeUserStatus,
);

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserController.deleteAccount,
);

export const UserRoutes = router;
