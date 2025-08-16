// src/app/modules/user/user.interface.ts
import { Document, Model } from 'mongoose';
import { USER_ROLES, STATUS } from '../../../enums/user';

export interface IDeviceToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  createdAt: Date;
}

export interface ISubscription {
  plan: string;
  status:
    | 'active'
    | 'cancelled'
    | 'past_due'
    | 'unpaid'
    | 'incomplete'
    | 'trialing'
    | 'expired';
  price: number;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  autoRenew: boolean;
  startDate: Date;
  endDate: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  trialEndDate?: Date;
  metadata?: Record<string, any>;
}

export interface IAuthentication {
  isResetPassword: boolean;
  oneTimeCode?: number;
  expireAt?: Date;
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  image?: string;
  role: USER_ROLES;
  status: STATUS;
  phoneNumber?: string;
  phoneCountryCode?: string;
  isDeleted: boolean;
  verified: boolean;
  isOnline: boolean;
  lastSeen: Date;
  deviceTokens: IDeviceToken[];
  isSubscribed: boolean;
  subscription?: ISubscription;
  authentication?: IAuthentication;
  createdAt: Date;
  updatedAt: Date;
  subscriptionStatus?: string; // Virtual property
}

export interface UserModal extends Model<IUser> {
  isExistUserById(id: string): Promise<IUser | null>;
  isExistUserByEmail(email: string): Promise<IUser | null>;
  isAccountCreated(id: string): Promise<IUser | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
}
