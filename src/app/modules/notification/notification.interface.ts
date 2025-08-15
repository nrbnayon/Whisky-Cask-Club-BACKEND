// src/app/modules/notification/notification.interface.ts
import { Document, Types } from 'mongoose';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SUBSCRIPTION' | 'MESSAGE' | 'BLOG' | 'SYSTEM';
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  expiresAt?: Date;
  actionUrl?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPushNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  actionUrl?: string;
}

export interface INotificationFilter {
  recipient?: string;
  type?: string;
  isRead?: boolean;
  priority?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}