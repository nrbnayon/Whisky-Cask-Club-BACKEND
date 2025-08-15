// src/app/modules/onlineStatus/onlineStatus.route.ts
import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { OnlineStatusController } from './onlineStatus.controller';

const router = express.Router();

// User routes
router.get(
  '/online-users',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  OnlineStatusController.getOnlineUsers
);

router.get(
  '/online-count',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  OnlineStatusController.getOnlineUsersCount
);

router.get(
  '/user/:userId/status',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  OnlineStatusController.checkUserOnlineStatus
);

router.post(
  '/heartbeat',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  OnlineStatusController.updateUserActivity
);

export const OnlineStatusRoutes = router;