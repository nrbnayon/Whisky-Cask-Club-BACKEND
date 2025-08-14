// src/app/modules/subscription/subscription.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import AppError from '../../errors/AppError';
import { logger } from '../../../shared/logger';
import { SubscriptionService } from './subscription.service';
import { stripe } from '../../../config/stripe.config';
import config from '../../../config';
import { CreateSubscriptionRequest } from './subscription.types';

class SubscriptionControllerClass {
  /**
   * Create subscription
   */
  createSubscription = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id || req.user?.userId;
    const userEmail = req.user?.email;
    const subscriptionData: CreateSubscriptionRequest = req.body;

    if (!userId || !userEmail) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await SubscriptionService.createSubscription(
      userId,
      userEmail,
      subscriptionData,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Subscription created successfully',
      data: result,
    });
  });

  /**
   * Cancel subscription
   */
  cancelSubscription = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await SubscriptionService.cancelSubscription(userId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Subscription cancelled successfully',
      data: result,
    });
  });

  /**
   * Reactivate subscription
   */
  reactivateSubscription = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await SubscriptionService.reactivateSubscription(userId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Subscription reactivated successfully',
      data: result,
    });
  });

  /**
   * Get subscription status
   */
  getSubscriptionStatus = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await SubscriptionService.getSubscriptionStatus(userId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Subscription status retrieved successfully',
      data: result,
    });
  });

  /**
   * Sync subscription status
   */
  syncSubscriptionStatus = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    const result = await SubscriptionService.syncSubscriptionStatus(userId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Subscription status synchronized successfully',
      data: result,
    });
  });

  /**
   * Change subscription plan
   */
  changeSubscriptionPlan = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id || req.user?.userId;
    const { plan } = req.body;

    if (!userId) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    if (!plan) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Plan is required');
    }

    const result = await SubscriptionService.changeSubscriptionPlan(
      userId,
      plan,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Subscription plan changed successfully',
      data: result,
    });
  });

  /**
   * Get available subscription plans
   */
  getAvailablePlans = catchAsync(async (req: Request, res: Response) => {
    const result = SubscriptionService.getAvailablePlans();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Available plans retrieved successfully',
      data: result,
    });
  });

  /**
   * Handle Stripe webhooks
   */
  handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers['stripe-signature'];

    if (!sig || typeof sig !== 'string') {
      logger.error('Missing or invalid Stripe signature header');
      return next(
        new AppError(StatusCodes.BAD_REQUEST, 'Missing Stripe signature'),
      );
    }

    let event: Stripe.Event;

    // Try webhook secrets in order of preference
    const webhookSecrets = [
      config.stripe.webhookSecret,
      config.stripe.localWebhookSecret,
    ].filter(Boolean);

    if (webhookSecrets.length === 0) {
      logger.error('No webhook secrets configured');
      return next(
        new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Webhook not configured',
        ),
      );
    }

    let webhookVerified = false;
    let lastError: Error | null = null;

    // Try each webhook secret
    for (let i = 0; i < webhookSecrets.length; i++) {
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          webhookSecrets[i] as string,
        );
        webhookVerified = true;
        logger.info(`Webhook verified with secret ${i + 1}`);
        break;
      } catch (err) {
        lastError = err as Error;
        logger.warn(
          `Webhook verification failed with secret ${i + 1}: ${lastError.message}`,
        );
      }
    }

    if (!webhookVerified) {
      logger.error('All webhook verifications failed:', lastError?.message);
      return next(
        new AppError(StatusCodes.BAD_REQUEST, 'Webhook verification failed'),
      );
    }

    logger.info(`Received webhook event: ${event!.type}`);

    try {
      await SubscriptionService.handleWebhook(event!);
      res.status(StatusCodes.OK).json({ received: true });
    } catch (error) {
      logger.error('Webhook processing error:', error);
      return next(
        new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Webhook processing failed',
        ),
      );
    }
  };

  /**
   * Get subscription metrics (Admin only)
   */
  getSubscriptionMetrics = catchAsync(async (req: Request, res: Response) => {
    // This would require admin authentication middleware
    const { User } = await import('../user/user.model');

    const metrics = await Promise.all([
      User.countDocuments({ isSubscribed: true }),
      User.countDocuments({ isSubscribed: false }),
      User.aggregate([
        { $match: { isSubscribed: true } },
        { $group: { _id: '$subscription.plan', count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: { isSubscribed: true } },
        { $group: { _id: '$subscription.status', count: { $sum: 1 } } },
      ]),
    ]);

    const [
      activeSubscriptions,
      inactiveUsers,
      planDistribution,
      statusDistribution,
    ] = metrics;

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Subscription metrics retrieved successfully',
      data: {
        activeSubscriptions,
        inactiveUsers,
        totalUsers: activeSubscriptions + inactiveUsers,
        planDistribution,
        statusDistribution,
      },
    });
  });
}

export const SubscriptionController = new SubscriptionControllerClass();
