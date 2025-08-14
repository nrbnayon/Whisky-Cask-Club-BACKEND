// src/app/modules/subscription/subscription.routes.ts
import { Router } from 'express';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionValidation } from './subscription.validation';
import auth from 'app/middlewares/auth';
import validateRequest from 'app/middlewares/validateRequest';
import { checkSubscriptionExpiry } from 'app/middlewares/checkSubscriptionExpiry';

const router = Router();

// Public routes
router.get('/plans', SubscriptionController.getAvailablePlans);

// Protected routes
router.post(
  '/create',
  auth('USER'),
  validateRequest(SubscriptionValidation.createSubscription),
  SubscriptionController.createSubscription,
);

router.post('/cancel', auth('USER'), checkSubscriptionExpiry, SubscriptionController.cancelSubscription);

router.post(
  '/reactivate',
  auth('USER'),
  checkSubscriptionExpiry,
  SubscriptionController.reactivateSubscription,
);

router.get(
  '/status',
  auth('USER'),
  checkSubscriptionExpiry,
  SubscriptionController.getSubscriptionStatus,
);

router.post(
  '/sync',
  auth('USER'),
  checkSubscriptionExpiry,
  SubscriptionController.syncSubscriptionStatus,
);

router.patch(
  '/change-plan',
  auth('USER'),
  checkSubscriptionExpiry,
  validateRequest(SubscriptionValidation.changePlan),
  SubscriptionController.changeSubscriptionPlan,
);

// Admin routes
router.get(
  '/metrics',
  auth('ADMIN'),
  SubscriptionController.getSubscriptionMetrics,
);

export const SubscriptionRoutes = router;
