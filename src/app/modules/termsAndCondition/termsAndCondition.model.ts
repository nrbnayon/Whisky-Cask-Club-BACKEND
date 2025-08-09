import { model, Schema } from 'mongoose';
import { TTermsCondition } from './termsAndCondition.interface';

const termsConditionSchema = new Schema<TTermsCondition>(
  {
    description: { type: String, required: true },
  },
  { timestamps: true },
);

export const TermsCondition = model<TTermsCondition>(
  'TermsCondition',
  termsConditionSchema,
);
