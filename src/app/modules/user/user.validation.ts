import { z } from 'zod';

const createUserSchema = z.object({
  body: z.object({
    full_name: z.string().min(1, 'Name is required'),
    email_address: z.string().email('Invalid email address'),
    phone_number: z.string().optional(),
    password: z.string().min(8, 'Password must have at least 8 characters'),
  }),
});

//TODO: need update more fields for this site

//* change some system
const updateUserProfileSchema = z.object({
  body: z.object({
    email_address: z.string().optional(),
    phone_number: z.string().optional(),
  }),
});

const updateLocationZodSchema = z.object({
  body: z.object({
    longitude: z.string({ message: 'Longitude is required' }),
    latitude: z.string({ message: 'Latitude is required' }),
  }),
});

export const UserValidation = {
  createUserSchema,
  updateLocationZodSchema,
  updateUserProfileSchema,
};
