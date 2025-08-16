// src/app/modules/activityLog/activityLog.model.ts
import { model, Schema } from 'mongoose';
import { IActivityLog } from './activityLog.interface';

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'LOGOUT',
        'REGISTER',
        'PASSWORD_CHANGE',
        'PASSWORD_RESET',
        'PROFILE_UPDATE',
        'EMAIL_VERIFY',
        'SUBSCRIPTION_CREATE',
        'SUBSCRIPTION_CANCEL',
        'SUBSCRIPTION_REACTIVATE',
        'BLOG_CREATE',
        'BLOG_UPDATE',
        'BLOG_DELETE',
        'MESSAGE_SEND',
        'FILE_UPLOAD',
        'ADMIN_ACTION',
        'DATA_EXPORT',
        'DATA_DELETE',
        'SETTINGS_UPDATE',
        'OTHER'
      ],
    },
    resource: {
      type: String,
      required: true,
      enum: [
        'USER',
        'AUTH',
        'BLOG',
        'MESSAGE',
        'SUBSCRIPTION',
        'FILE',
        'ADMIN',
        'SETTINGS',
        'OTHER'
      ],
    },
    resourceId: {
      type: Schema.Types.ObjectId,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better performance
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ resource: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });

// TTL index to automatically delete old logs after 90 days
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export const ActivityLog = model<IActivityLog>('ActivityLog', activityLogSchema);