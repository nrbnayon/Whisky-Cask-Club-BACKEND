// src/types/emailTemplate.ts

export interface ICreateAccount {
  email: string;
  name: string;
  otp: number;
}

export interface IResetPassword {
  email: string;
  otp: number;
}

export interface INewsletterSubscriber {
  email: string;
  name: string;
}
