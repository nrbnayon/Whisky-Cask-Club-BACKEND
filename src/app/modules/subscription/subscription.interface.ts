// src\app\modules\subscription\subscription.interface.ts
export interface ISubscrition {
  subscription?: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    status: string;
    price: number;
    autoRenew: boolean;
    startDate: Date;
    endDate: Date;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    [key: string]: unknown;
  };
}
