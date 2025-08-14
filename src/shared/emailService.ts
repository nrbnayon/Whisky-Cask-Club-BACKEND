// src/shared/emailService.ts
import { logger } from './logger';
import config from '../config';
import { IUser } from '../app/modules/user/user.interface';
import { transporter } from 'helpers/emailHelper';

type EmailType =
  | 'welcome'
  | 'cancelled'
  | 'reactivated'
  | 'expired'
  | 'payment_success'
  | 'payment_failed'
  | 'trial_ending'
  | 'plan_changed';

interface EmailData {
  plan?: string;
  price?: number;
  amount?: number;
  currency?: string;
  startDate?: Date;
  endDate?: Date;
  trialEndDate?: Date;
  error?: string;
  retryDate?: Date;
  oldPlan?: string;
  newPlan?: string;
  newPrice?: number;
}

const emailTemplates = {
  welcome: (data: EmailData) => ({
    subject: `Welcome to ${data.plan}!`,
    html: `
      <h1>Welcome to ${data.plan}!</h1>
      <p>Your subscription is now active.</p>
      <p><strong>Plan:</strong> ${data.plan}</p>
      <p><strong>Price:</strong> ${data.price}/month</p>
      <p><strong>Start Date:</strong> ${data.startDate?.toDateString()}</p>
      <p><strong>Next Billing:</strong> ${data.endDate?.toDateString()}</p>
      ${data.trialEndDate ? `<p><strong>Trial Ends:</strong> ${data.trialEndDate.toDateString()}</p>` : ''}
      <p>Thank you for choosing our service!</p>
    `,
  }),

  cancelled: (data: EmailData) => ({
    subject: 'Subscription Cancelled',
    html: `
      <h1>Subscription Cancelled</h1>
      <p>Your ${data.plan} subscription has been cancelled.</p>
      <p>You'll continue to have access until ${data.endDate?.toDateString()}.</p>
      <p>You can reactivate your subscription anytime before it expires.</p>
    `,
  }),

  reactivated: (data: EmailData) => ({
    subject: 'Subscription Reactivated',
    html: `
      <h1>Subscription Reactivated</h1>
      <p>Great news! Your ${data.plan} subscription has been reactivated.</p>
      <p>Your next billing date is ${data.endDate?.toDateString()}.</p>
    `,
  }),

  expired: (data: EmailData) => ({
    subject: 'Subscription Expired',
    html: `
      <h1>Subscription Expired</h1>
      <p>Your ${data.plan} subscription has expired.</p>
      <p>To continue enjoying our premium features, please renew your subscription.</p>
    `,
  }),

  payment_success: (data: EmailData) => ({
    subject: 'Payment Successful',
    html: `
      <h1>Payment Received</h1>
      <p>Thank you! Your payment of ${data.amount} ${data.currency?.toUpperCase()} has been processed successfully.</p>
      <p>Your ${data.plan} subscription is active until ${data.endDate?.toDateString()}.</p>
    `,
  }),

  payment_failed: (data: EmailData) => ({
    subject: 'Payment Failed',
    html: `
      <h1>Payment Failed</h1>
      <p>We couldn't process your payment for ${data.plan}.</p>
      <p><strong>Error:</strong> ${data.error}</p>
      <p>We'll retry on ${data.retryDate?.toDateString()}. Please ensure your payment method is valid.</p>
    `,
  }),

  trial_ending: (data: EmailData) => ({
    subject: 'Trial Ending Soon',
    html: `
      <h1>Your Trial is Ending Soon</h1>
      <p>Your ${data.plan} trial ends on ${data.trialEndDate?.toDateString()}.</p>
      <p>Add a payment method to continue enjoying premium features.</p>
    `,
  }),

  plan_changed: (data: EmailData) => ({
    subject: 'Subscription Plan Changed',
    html: `
      <h1>Plan Changed Successfully</h1>
      <p>Your subscription has been updated from ${data.oldPlan} to ${data.newPlan}.</p>
      <p><strong>New Price:</strong> ${data.newPrice}/month</p>
      <p>Changes take effect immediately.</p>
    `,
  }),
};

export const sendSubscriptionEmail = async (
  user: IUser,
  type: EmailType,
  data: EmailData,
): Promise<void> => {
  try {
    const template = emailTemplates[type](data);

    await transporter.sendMail({
      from: config.email.from,
      to: user.email,
      subject: template.subject,
      html: template.html,
    });

    logger.info(`${type} email sent to ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send ${type} email to ${user.email}:`, error);
    // Don't throw error - email failure shouldn't break the subscription process
  }
};
