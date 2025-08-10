/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';

export type IUser = {
  full_name: string;
  email_address: string;
  phone_number?: string;
  password: string;
  isDeleted?: boolean;
  image?: string;
  role?: string;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  verified: boolean;
  [key: string]: unknown;
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email_address: string): any;
  isAccountCreated(id: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;

/*
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  */
