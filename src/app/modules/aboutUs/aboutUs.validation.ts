import { z } from 'zod';

const createAboutValidation = z.object({
  body: z.object({
    description: z.string(),
  }),
});

const updateAboutValidation = z.object({
  body: z.object({
    description: z.string().optional(),
  }),
});

export const aboutValidations = {
  createAboutValidation,
  updateAboutValidation,
};
