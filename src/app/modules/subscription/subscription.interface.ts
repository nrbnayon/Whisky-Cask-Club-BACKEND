export interface ISubscrition {
  subscription?: {
    plan: 'basic' | 'premium';
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
