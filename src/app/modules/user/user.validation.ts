// src/app/modules/user/user.validation.ts
import { z } from 'zod';
import { USER_ROLES, STATUS } from '../../../enums/user';

const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().optional(),
    phoneCountryCode: z.string().optional(),
    password: z.string().min(8, 'Password must have at least 8 characters'),
  }),
});

const updateUserProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(1).max(100).optional(),
    phoneNumber: z.string().optional(),
    phoneCountryCode: z.string().optional(),
  }),
});

const updateProfileImageSchema = z.object({
  body: z.object({
    // Image will be handled by multer middleware
  }),
});

const adminUpdateUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    role: z.nativeEnum(USER_ROLES).optional(),
    status: z.nativeEnum(STATUS).optional(),
    phoneNumber: z.string().optional(),
    phoneCountryCode: z.string().optional(),
    verified: z.boolean().optional(),
    isSubscribed: z.boolean().optional(),
  }),
});

const changeUserStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(STATUS),
  }),
});

export const UserValidation = {
  createUserSchema,
  updateUserProfileSchema,
  updateProfileImageSchema,
  adminUpdateUserSchema,
  changeUserStatusSchema,
};
