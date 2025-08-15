// src/app/modules/activityLog/activityLog.route.ts
import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { ActivityLogController } from './activityLog.controller';

const router = express.Router();

// User routes
router.get(
  '/my-activities',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ActivityLogController.getUserActivities
);

// Admin routes
router.get(
  '/all',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ActivityLogController.getAllActivities
);

router.get(
  '/stats',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ActivityLogController.getActivityStats
);

export const ActivityLogRoutes = router;