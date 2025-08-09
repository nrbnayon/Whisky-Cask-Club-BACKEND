import { model, Schema } from 'mongoose';

import { TPrivacy } from './privacy.interface';

const privacySchema = new Schema<TPrivacy>(
  {
    description: { type: String, required: true },
  },
  { timestamps: true },
);

export const Privacy = model<TPrivacy>('Privacy', privacySchema);
