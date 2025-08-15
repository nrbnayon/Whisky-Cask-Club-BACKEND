// src/app/modules/activityLog/activityLog.interface.ts
import { Document, Types } from 'mongoose';

export interface IActivityLog extends Document {
  user: Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: Types.ObjectId;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface IActivityLogFilter {
  user?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}