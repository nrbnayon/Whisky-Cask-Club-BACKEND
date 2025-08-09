import { z } from 'zod';

const createSettingValidation = z.object({
  body: z.object({
    description: z.string(),
  }),
});

const updateSettingValidation = z.object({
  body: z.object({
    description: z.string().optional(),
  }),
});

export const settingValidaitons = {
  createSettingValidation,
  updateSettingValidation,
};
