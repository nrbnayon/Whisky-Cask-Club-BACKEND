// src/app/modules/notification/notification.validation.ts
import { z } from 'zod';

const registerDeviceToken = z.object({
  body: z.object({
    token: z.string().min(1, 'Device token is required'),
    platform: z.enum(['ios', 'android', 'web']).default('web'),
  }),
});

const unregisterDeviceToken = z.object({
  body: z.object({
    token: z.string().min(1, 'Device token is required'),
  }),
});

const sendBulkNotifications = z.object({
  body: z.object({
    userIds: z.array(z.string()).min(1, 'At least one user ID is required'),
    title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
    message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
    type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'SUBSCRIPTION', 'MESSAGE', 'BLOG', 'SYSTEM']).default('INFO'),
    data: z.record(z.any()).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    sendPush: z.boolean().default(true),
  }),
});

export const NotificationValidation = {
  registerDeviceToken,
  unregisterDeviceToken,
  sendBulkNotifications,
};