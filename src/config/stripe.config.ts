// src/config/stripe.config.ts
import Stripe from 'stripe';
import config from './index';

if (!config.stripe.secretKey) {
  throw new Error('Stripe secret key is required');
}

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion, // Type asserted
});

export const SUBSCRIPTION_PLANS = {
  basic: {
    name: process.env.STRIPE_BASIC_PLAN_NAME || 'Basic Plan',
    priceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic',
    price: Number(process.env.STRIPE_BASIC_PRICE) || 9.99,
    interval: 'month' as const,
    features: ['Feature 1', 'Feature 2'],
  },
  premium: {
    name: process.env.STRIPE_PREMIUM_PLAN_NAME || 'Premium Plan',
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
    price: Number(process.env.STRIPE_PREMIUM_PRICE) || 19.99,
    interval: 'month' as const,
    features: ['All Basic Features', 'Feature 3', 'Feature 4'],
  },
  enterprise: {
    name: process.env.STRIPE_ENTERPRISE_PLAN_NAME || 'Enterprise Plan',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    price: Number(process.env.STRIPE_ENTERPRISE_PRICE) || 49.99,
    interval: 'month' as const,
    features: ['All Premium Features', 'Feature 5', 'Priority Support'],
  },
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;
