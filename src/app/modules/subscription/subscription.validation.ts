// src/app/modules/subscription/subscription.validation.ts
import { z } from 'zod';
import { SUBSCRIPTION_PLANS } from '../../../config/stripe.config';

const subscriptionPlans = Object.keys(SUBSCRIPTION_PLANS) as [
  string,
  ...string[],
];

export const SubscriptionValidation = {
  createSubscription: z.object({
    body: z.object({
      plan: z.enum(subscriptionPlans, {
        // z.enum only supports `error` or `message` in Zod v3+
        error: 'Invalid plan selected',
      }),
      price: z
        .number({
          message: 'Price must be a number',
        })
        .positive('Price must be positive'),
      paymentMethodId: z.string().optional(),
      trialDays: z
        .number()
        .int()
        .min(0)
        .max(30, 'Trial period cannot exceed 30 days')
        .optional(),
      // In latest Zod, record() requires key and value types
      metadata: z.record(z.string(), z.any()).optional(),
    }),
  }),

  changePlan: z.object({
    body: z.object({
      plan: z.enum(subscriptionPlans, {
        error: 'Invalid plan selected',
      }),
    }),
  }),
};
