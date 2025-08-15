// src/app/modules/notification/notification.route.ts
import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { NotificationController } from './notification.controller';
import validateRequest from '../../middlewares/validateRequest';
import { NotificationValidation } from './notification.validation';

const router = express.Router();

// User routes
router.get(
  '/my-notifications',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  NotificationController.getUserNotifications
);

router.patch(
  '/:id/read',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  NotificationController.markAsRead
);

router.patch(
  '/mark-all-read',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  NotificationController.markAllAsRead
);

router.delete(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  NotificationController.deleteNotification
);

router.delete(
  '/all/delete',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  NotificationController.deleteAllNotifications
);

router.post(
  '/device-token/register',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(NotificationValidation.registerDeviceToken),
  NotificationController.registerDeviceToken
);

router.post(
  '/device-token/unregister',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(NotificationValidation.unregisterDeviceToken),
  NotificationController.unregisterDeviceToken
);

// Admin routes
router.post(
  '/bulk-send',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(NotificationValidation.sendBulkNotifications),
  NotificationController.sendBulkNotifications
);

router.get(
  '/stats',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  NotificationController.getNotificationStats
);

export const NotificationRoutes = router;