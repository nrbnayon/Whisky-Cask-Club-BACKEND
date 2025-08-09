import { z } from 'zod';

const createPrivacyValidation = z.object({
  body: z.object({
    description: z.string(),
  }),
});

const updatePrivacyValidation = z.object({
  body: z.object({
    description: z.string().optional(),
  }),
});

export const privacyValidations = {
  createPrivacyValidation,
  updatePrivacyValidation,
};
