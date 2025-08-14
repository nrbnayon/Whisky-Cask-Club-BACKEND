// src/app/modules/subscription/subscription.service.ts
import mongoose from 'mongoose';
import Stripe from 'stripe';
import {
  stripe,
  SUBSCRIPTION_PLANS,
  SubscriptionPlan,
} from '../../../config/stripe.config';
import { User } from '../user/user.model';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../../../shared/logger';
import {
  CreateSubscriptionRequest,
  SubscriptionResponse,
  SubscriptionStatusResponse,
} from './subscription.types';
import { sendSubscriptionEmail } from '../../../shared/emailService';

class SubscriptionServiceClass {
  /**
   * Create a new subscription
   */
  async createSubscription(
    userId: string,
    userEmail: string,
    data: CreateSubscriptionRequest,
  ): Promise<SubscriptionResponse> {
    const { plan, price, paymentMethodId, trialDays, metadata } = data;

    // Validate plan and price
    const subscriptionPlan = SUBSCRIPTION_PLANS[plan];
    if (!subscriptionPlan) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid subscription plan');
    }

    if (price !== subscriptionPlan.price) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Invalid price. Expected ${subscriptionPlan.price} for ${plan} plan`,
      );
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    // Check if user already has active subscription
    if (user.isSubscribed && user.subscription?.status === 'active') {
      throw new AppError(
        StatusCodes.CONFLICT,
        'User already has an active subscription',
      );
    }

    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        // Create or get Stripe customer
        let stripeCustomerId = user.subscription?.stripeCustomerId;

        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: userEmail,
            name: user.fullName,
            metadata: {
              userId: userId,
              ...metadata,
            },
          });
          stripeCustomerId = customer.id;
        }

        // Attach payment method if provided
        if (paymentMethodId) {
          await stripe.paymentMethods.attach(paymentMethodId, {
            customer: stripeCustomerId,
          });

          await stripe.customers.update(stripeCustomerId, {
            invoice_settings: {
              default_payment_method: paymentMethodId,
            },
          });
        }

        // Create subscription parameters
        const subscriptionParams: Stripe.SubscriptionCreateParams = {
          customer: stripeCustomerId,
          items: [{ price: subscriptionPlan.priceId }],
          payment_behavior: 'default_incomplete',
          payment_settings: {
            save_default_payment_method: 'on_subscription',
            payment_method_types: ['card'],
          },
          expand: ['latest_invoice.payment_intent'],
          metadata: {
            userId,
            plan,
            ...metadata,
          },
        };

        // Add trial period if specified
        if (trialDays && trialDays > 0) {
          subscriptionParams.trial_period_days = trialDays;
        }

        // Create Stripe subscription
        const subscription =
          await stripe.subscriptions.create(subscriptionParams);

        const invoice = subscription.latest_invoice as Stripe.Invoice;
        const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent;

        // Calculate dates
        const startDate = new Date(subscription.current_period_start * 1000);
        const endDate = new Date(subscription.current_period_end * 1000);
        const trialEndDate = subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : undefined;

        // Update user in database
        const updateData = {
          isSubscribed:
            subscription.status === 'active' ||
            subscription.status === 'trialing',
          subscription: {
            plan,
            status: subscription.status,
            price: subscriptionPlan.price,
            currency: 'usd',
            interval: subscriptionPlan.interval,
            autoRenew: !subscription.cancel_at_period_end,
            startDate,
            endDate,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId,
            stripePriceId: subscriptionPlan.priceId,
            trialEndDate,
            metadata,
          },
        };

        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $set: updateData },
          { new: true, session },
        );

        if (!updatedUser) {
          throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to update user subscription',
          );
        }

        logger.info(
          `Subscription created for user ${userId}: ${subscription.id}`,
        );

        // Send welcome email for active subscriptions
        if (
          subscription.status === 'active' ||
          subscription.status === 'trialing'
        ) {
          await sendSubscriptionEmail(updatedUser, 'welcome', {
            plan: subscriptionPlan.name,
            price: subscriptionPlan.price,
            startDate,
            endDate,
            trialEndDate,
          });
        }

        return {
          subscriptionId: subscription.id,
          clientSecret: paymentIntent?.client_secret,
          status: subscription.status,
          currentPeriodEnd: endDate,
          plan,
          price: subscriptionPlan.price,
          requiresAction: paymentIntent?.status === 'requires_action',
          paymentIntentStatus: paymentIntent?.status,
          trialEnd: trialEndDate,
        };
      });
    } catch (error) {
      logger.error('Subscription creation error:', error);
      throw error instanceof AppError
        ? error
        : new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to create subscription',
          );
    } finally {
      await session.endSession();
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (!user.isSubscribed || !user.subscription?.stripeSubscriptionId) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'No active subscription found',
      );
    }

    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const stripeSubscriptionId = user.subscription!.stripeSubscriptionId!;

        // Cancel subscription at period end
        const cancelledSubscription = await stripe.subscriptions.update(
          stripeSubscriptionId,
          {
            cancel_at_period_end: true,
            metadata: {
              cancelledBy: 'user',
              cancelledAt: new Date().toISOString(),
            },
          },
        );

        const endDate = new Date(
          cancelledSubscription.current_period_end * 1000,
        );

        // Update user subscription
        const updateData = {
          'subscription.status': cancelledSubscription.status,
          'subscription.autoRenew': false,
          'subscription.cancelAtPeriodEnd': true,
          'subscription.endDate': endDate,
        };

        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $set: updateData },
          { new: true, session },
        );

        if (!updatedUser) {
          throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to update subscription',
          );
        }

        logger.info(
          `Subscription cancelled for user ${userId}: ${stripeSubscriptionId}`,
        );

        // Send cancellation email
        await sendSubscriptionEmail(updatedUser, 'cancelled', {
          plan: user.subscription.plan,
          endDate,
        });

        return {
          message:
            'Subscription will be cancelled at the end of the current period',
          cancelAtPeriodEnd: endDate,
          status: cancelledSubscription.status,
        };
      });
    } catch (error) {
      logger.error('Subscription cancellation error:', error);
      throw error instanceof AppError
        ? error
        : new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to cancel subscription',
          );
    } finally {
      await session.endSession();
    }
  }

  /**
   * Reactivate cancelled subscription
   */
  async reactivateSubscription(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (!user.subscription?.stripeSubscriptionId) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'No subscription found');
    }

    if (!user.subscription.cancelAtPeriodEnd) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Subscription is not scheduled for cancellation',
      );
    }

    try {
      const stripeSubscriptionId = user.subscription.stripeSubscriptionId;

      // Reactivate subscription
      const reactivatedSubscription = await stripe.subscriptions.update(
        stripeSubscriptionId,
        {
          cancel_at_period_end: false,
          metadata: {
            reactivatedBy: 'user',
            reactivatedAt: new Date().toISOString(),
          },
        },
      );

      // Update user subscription
      const updateData = {
        'subscription.status': reactivatedSubscription.status,
        'subscription.autoRenew': true,
        'subscription.cancelAtPeriodEnd': false,
      };

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true },
      );

      if (!updatedUser) {
        throw new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Failed to update subscription',
        );
      }

      logger.info(
        `Subscription reactivated for user ${userId}: ${stripeSubscriptionId}`,
      );

      // Send reactivation email
      await sendSubscriptionEmail(updatedUser, 'reactivated', {
        plan: user.subscription.plan,
        endDate: new Date(reactivatedSubscription.current_period_end * 1000),
      });

      return {
        message: 'Subscription has been reactivated',
        status: reactivatedSubscription.status,
      };
    } catch (error) {
      logger.error('Subscription reactivation error:', error);
      throw error instanceof AppError
        ? error
        : new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to reactivate subscription',
          );
    }
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(
    userId: string,
  ): Promise<SubscriptionStatusResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (!user.subscription?.stripeSubscriptionId) {
      return {
        isSubscribed: false,
        subscription: null,
      };
    }

    try {
      // Get latest data from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(
        user.subscription.stripeSubscriptionId,
      );

      // Calculate dates
      const startDate = new Date(
        stripeSubscription.current_period_start * 1000,
      );
      const endDate = new Date(stripeSubscription.current_period_end * 1000);
      const trialEndDate = stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : undefined;

      // Update local database with latest Stripe data
      const updateData = {
        isSubscribed: ['active', 'trialing'].includes(
          stripeSubscription.status,
        ),
        'subscription.status': stripeSubscription.status,
        'subscription.startDate': startDate,
        'subscription.endDate': endDate,
        'subscription.cancelAtPeriodEnd':
          stripeSubscription.cancel_at_period_end,
        'subscription.autoRenew': !stripeSubscription.cancel_at_period_end,
        ...(trialEndDate && { 'subscription.trialEndDate': trialEndDate }),
      };

      await User.findByIdAndUpdate(userId, { $set: updateData });

      return {
        isSubscribed: ['active', 'trialing'].includes(
          stripeSubscription.status,
        ),
        subscription: {
          plan: user.subscription.plan,
          status: stripeSubscription.status,
          price: user.subscription.price,
          currency: user.subscription.currency,
          interval: user.subscription.interval,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          startDate: user.subscription.startDate,
          endDate: endDate,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          autoRenew: !stripeSubscription.cancel_at_period_end,
          trialEnd: trialEndDate,
        },
      };
    } catch (error) {
      logger.error('Error fetching subscription status:', error);
      throw error instanceof AppError
        ? error
        : new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to fetch subscription status',
          );
    }
  }

  /**
   * Sync subscription status with Stripe
   */
  async syncSubscriptionStatus(userId: string) {
    const user = await User.findById(userId);
    if (!user || !user.subscription?.stripeSubscriptionId) {
      throw new AppError(StatusCodes.NOT_FOUND, 'No subscription found');
    }

    try {
      const subscription = await stripe.subscriptions.retrieve(
        user.subscription.stripeSubscriptionId,
      );

      const updateData = {
        isSubscribed: ['active', 'trialing'].includes(subscription.status),
        'subscription.status': subscription.status,
        'subscription.startDate': new Date(
          subscription.current_period_start * 1000,
        ),
        'subscription.endDate': new Date(
          subscription.current_period_end * 1000,
        ),
        'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
        'subscription.autoRenew': !subscription.cancel_at_period_end,
      };

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true },
      );

      logger.info(
        `Synced subscription status for user ${userId}: ${subscription.status}`,
      );
      return updatedUser;
    } catch (error) {
      logger.error(`Failed to sync subscription for user ${userId}:`, error);
      throw error instanceof AppError
        ? error
        : new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to sync subscription status',
          );
    }
  }

  /**
   * Handle Stripe webhooks
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        switch (event.type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
            await this.handleSubscriptionUpdated(
              event.data.object as Stripe.Subscription,
              session,
            );
            break;

          case 'customer.subscription.deleted':
            await this.handleSubscriptionDeleted(
              event.data.object as Stripe.Subscription,
              session,
            );
            break;

          case 'invoice.payment_succeeded':
            await this.handlePaymentSucceeded(
              event.data.object as Stripe.Invoice,
              session,
            );
            break;

          case 'invoice.payment_failed':
            await this.handlePaymentFailed(
              event.data.object as Stripe.Invoice,
              session,
            );
            break;

          case 'customer.subscription.trial_will_end':
            await this.handleTrialWillEnd(
              event.data.object as Stripe.Subscription,
            );
            break;

          default:
            logger.info(`Unhandled webhook event type: ${event.type}`);
        }
      });
    } catch (error) {
      logger.error('Webhook processing error:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Process expired subscriptions (run as a cron job)
   */
  async processExpiredSubscriptions(): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const now = new Date();

        // Find users with expired subscriptions
        const expiredUsers = await User.find({
          isSubscribed: true,
          'subscription.endDate': { $lt: now },
          'subscription.status': { $in: ['active', 'trialing', 'past_due'] },
        }).session(session);

        logger.info(`Processing ${expiredUsers.length} expired subscriptions`);

        for (const user of expiredUsers) {
          if (user.subscription?.stripeSubscriptionId) {
            try {
              // Verify with Stripe
              const stripeSubscription = await stripe.subscriptions.retrieve(
                user.subscription.stripeSubscriptionId,
              );

              // Update based on Stripe status
              const shouldExpire = [
                'canceled',
                'unpaid',
                'incomplete_expired',
              ].includes(stripeSubscription.status);

              if (shouldExpire) {
                await User.findByIdAndUpdate(
                  user._id,
                  {
                    $set: {
                      isSubscribed: false,
                      'subscription.status': 'expired',
                    },
                  },
                  { session },
                );

                logger.info(`Expired subscription for user ${user._id}`);

                // Send expiration email
                await sendSubscriptionEmail(user, 'expired', {
                  plan: user.subscription.plan,
                });
              }
            } catch (stripeError) {
              logger.error(
                `Error checking Stripe subscription for user ${user._id}:`,
                stripeError,
              );

              // If subscription not found in Stripe, mark as expired
              await User.findByIdAndUpdate(
                user._id,
                {
                  $set: {
                    isSubscribed: false,
                    'subscription.status': 'expired',
                  },
                },
                { session },
              );
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error processing expired subscriptions:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // Private helper methods for webhook handling
  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
    session: mongoose.ClientSession,
  ): Promise<void> {
    const customer = await stripe.customers.retrieve(
      subscription.customer as string,
    );
    if (!customer || customer.deleted) {
      logger.error('Customer not found for subscription:', subscription.id);
      return;
    }

    const userId = (customer as Stripe.Customer).metadata?.userId;
    if (!userId) {
      logger.error('User ID not found in customer metadata:', customer.id);
      return;
    }

    const startDate = new Date(subscription.current_period_start * 1000);
    const endDate = new Date(subscription.current_period_end * 1000);
    const trialEndDate = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : undefined;

    const updateData = {
      isSubscribed: ['active', 'trialing'].includes(subscription.status),
      'subscription.status': subscription.status,
      'subscription.startDate': startDate,
      'subscription.endDate': endDate,
      'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
      'subscription.autoRenew': !subscription.cancel_at_period_end,
      'subscription.stripeSubscriptionId': subscription.id,
      ...(trialEndDate && { 'subscription.trialEndDate': trialEndDate }),
    };

    await User.findByIdAndUpdate(userId, { $set: updateData }, { session });
    logger.info(
      `Updated subscription for user ${userId}: ${subscription.status}`,
    );
  }

  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
    session: mongoose.ClientSession,
  ): Promise<void> {
    const customer = await stripe.customers.retrieve(
      subscription.customer as string,
    );
    if (!customer || customer.deleted) {
      logger.warn(
        `Customer not found for deleted subscription: ${subscription.id}`,
      );
      return;
    }

    const userId = (customer as Stripe.Customer).metadata?.userId;
    if (!userId) {
      logger.warn(
        `User ID not found for deleted subscription: ${subscription.id}`,
      );
      return;
    }

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          isSubscribed: false,
          'subscription.status': 'cancelled',
          'subscription.autoRenew': false,
        },
      },
      { session },
    );

    logger.info(`Subscription deleted for user ${userId}: ${subscription.id}`);
  }

  private async handlePaymentSucceeded(
    invoice: Stripe.Invoice,
    session: mongoose.ClientSession,
  ): Promise<void> {
    if (!invoice.subscription) return;

    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string,
    );
    const customer = await stripe.customers.retrieve(
      subscription.customer as string,
    );

    if (!customer || customer.deleted) {
      logger.error(
        'Customer not found for successful payment:',
        subscription.id,
      );
      return;
    }

    const userId = (customer as Stripe.Customer).metadata?.userId;
    if (!userId) {
      logger.error('User ID not found for successful payment:', customer.id);
      return;
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      logger.error('User not found for successful payment:', userId);
      return;
    }

    const startDate = new Date(subscription.current_period_start * 1000);
    const endDate = new Date(subscription.current_period_end * 1000);

    const updateData = {
      isSubscribed: true,
      'subscription.status': 'active',
      'subscription.startDate': startDate,
      'subscription.endDate': endDate,
      'subscription.autoRenew': !subscription.cancel_at_period_end,
    };

    await User.findByIdAndUpdate(userId, { $set: updateData }, { session });

    logger.info(`Payment succeeded for user ${userId}: ${subscription.id}`);

    // Send payment success email
    await sendSubscriptionEmail(user, 'payment_success', {
      plan: user.subscription?.plan || 'Unknown',
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      endDate,
    });
  }

  private async handlePaymentFailed(
    invoice: Stripe.Invoice,
    session: mongoose.ClientSession,
  ): Promise<void> {
    const customer = await stripe.customers.retrieve(
      invoice.customer as string,
    );
    if (!customer || customer.deleted) return;

    const userId = (customer as Stripe.Customer).metadata?.userId;
    if (!userId) return;

    const user = await User.findById(userId).session(session);
    if (!user) return;

    await User.findByIdAndUpdate(
      userId,
      { 'subscription.status': 'past_due' },
      { session },
    );

    const errorMessage =
      invoice.last_payment_error?.message || 'Payment failed';
    logger.error(`Payment failed for user ${userId}: ${errorMessage}`);

    // Send payment failed email
    await sendSubscriptionEmail(user, 'payment_failed', {
      plan: user.subscription?.plan || 'Unknown',
      error: errorMessage,
      retryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    });
  }

  private async handleTrialWillEnd(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const customer = await stripe.customers.retrieve(
      subscription.customer as string,
    );
    if (!customer || customer.deleted) return;

    const userId = (customer as Stripe.Customer).metadata?.userId;
    if (!userId) return;

    const user = await User.findById(userId);
    if (!user) return;

    const trialEndDate = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null;

    logger.info(`Trial ending soon for user ${userId}: ${subscription.id}`);

    // Send trial ending email
    await sendSubscriptionEmail(user, 'trial_ending', {
      plan: user.subscription?.plan || 'Unknown',
      trialEndDate,
    });
  }

  /**
   * Change subscription plan
   */
  async changeSubscriptionPlan(
    userId: string,
    newPlan: SubscriptionPlan,
  ): Promise<SubscriptionResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (!user.subscription?.stripeSubscriptionId) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'No active subscription found',
      );
    }

    const newPlanConfig = SUBSCRIPTION_PLANS[newPlan];
    if (!newPlanConfig) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid subscription plan');
    }

    try {
      // Get current subscription
      const currentSubscription = await stripe.subscriptions.retrieve(
        user.subscription.stripeSubscriptionId,
      );

      // Update subscription with new price
      const updatedSubscription = await stripe.subscriptions.update(
        user.subscription.stripeSubscriptionId,
        {
          items: [
            {
              id: currentSubscription.items.data[0].id,
              price: newPlanConfig.priceId,
            },
          ],
          proration_behavior: 'create_prorations',
          metadata: {
            ...currentSubscription.metadata,
            previousPlan: user.subscription.plan,
            newPlan,
            planChangeDate: new Date().toISOString(),
          },
        },
      );

      // Update user subscription
      const updateData = {
        'subscription.plan': newPlan,
        'subscription.price': newPlanConfig.price,
        'subscription.stripePriceId': newPlanConfig.priceId,
        'subscription.status': updatedSubscription.status,
      };

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true },
      );

      if (!updatedUser) {
        throw new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Failed to update subscription plan',
        );
      }

      logger.info(
        `Plan changed for user ${userId}: ${user.subscription.plan} -> ${newPlan}`,
      );

      // Send plan change email
      await sendSubscriptionEmail(updatedUser, 'plan_changed', {
        oldPlan: user.subscription.plan,
        newPlan: newPlanConfig.name,
        newPrice: newPlanConfig.price,
      });

      return {
        subscriptionId: updatedSubscription.id,
        status: updatedSubscription.status,
        currentPeriodEnd: new Date(
          updatedSubscription.current_period_end * 1000,
        ),
        plan: newPlan,
        price: newPlanConfig.price,
      };
    } catch (error) {
      logger.error('Plan change error:', error);
      throw error instanceof AppError
        ? error
        : new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to change subscription plan',
          );
    }
  }

  /**
   * Get subscription plans
   */
  getAvailablePlans() {
    return Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      price: plan.price,
      interval: plan.interval,
      features: plan.features,
      priceId: plan.priceId,
    }));
  }
}

export const SubscriptionService = new SubscriptionServiceClass();
