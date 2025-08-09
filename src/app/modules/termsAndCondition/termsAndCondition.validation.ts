import { z } from 'zod';

const createTermsConditionSchemaValidation = z.object({
  body: z.object({
    description: z.string(),
  }),
});

const updateTermsConditionSchemaValidation = z.object({
  body: z.object({
    description: z.string().optional(),
  }),
});

export const tersmConditionValidation = {
  createTermsConditionSchemaValidation,
  updateTermsConditionSchemaValidation,
};
