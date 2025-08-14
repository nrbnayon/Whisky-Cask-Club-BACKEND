// src/app/modules/subscription/subscription.types.ts
import { SubscriptionPlan } from '../../../config/stripe.config';

export interface CreateSubscriptionRequest {
  plan: SubscriptionPlan;
  price: number;
  paymentMethodId?: string;
  trialDays?: number;
  metadata?: Record<string, any>;
}

export interface SubscriptionResponse {
  subscriptionId: string;
  clientSecret?: string;
  status: string;
  currentPeriodEnd: Date;
  plan: string;
  price: number;
  requiresAction?: boolean;
  paymentIntentStatus?: string;
  trialEnd?: Date;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

export interface SubscriptionStatusResponse {
  isSubscribed: boolean;
  subscription: {
    plan: string;
    status: string;
    price: number;
    currency: string;
    interval: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    startDate: Date;
    endDate: Date;
    cancelAtPeriodEnd: boolean;
    autoRenew: boolean;
    trialEnd?: Date;
  } | null;
}
