// src/app/modules/subscription/subscription.routes.ts
import { Router } from 'express';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionValidation } from './subscription.validation';
import auth from 'app/middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from 'app/middlewares/validateRequest';
import { checkSubscriptionExpiry } from 'app/middlewares/checkSubscriptionExpiry';

const router = Router();

// Public routes
router.get('/plans', SubscriptionController.getAvailablePlans);

// Protected routes
router.post(
  '/create',
  auth(USER_ROLES.USER),
  validateRequest(SubscriptionValidation.createSubscription),
  SubscriptionController.createSubscription,
);

router.post('/cancel', auth(USER_ROLES.USER), checkSubscriptionExpiry, SubscriptionController.cancelSubscription);

router.post(
  '/reactivate',
  auth(USER_ROLES.USER),
  checkSubscriptionExpiry,
  SubscriptionController.reactivateSubscription,
);

router.get(
  '/status',
  auth(USER_ROLES.USER),
  checkSubscriptionExpiry,
  SubscriptionController.getSubscriptionStatus,
);

router.post(
  '/sync',
  auth(USER_ROLES.USER),
  checkSubscriptionExpiry,
  SubscriptionController.syncSubscriptionStatus,
);

router.patch(
  '/change-plan',
  auth(USER_ROLES.USER),
  checkSubscriptionExpiry,
  validateRequest(SubscriptionValidation.changePlan),
  SubscriptionController.changeSubscriptionPlan,
);

// Admin routes
router.get(
  '/metrics',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SubscriptionController.getSubscriptionMetrics,
);

export const SubscriptionRoutes = router;
