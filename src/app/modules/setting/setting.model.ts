import { model, Schema } from 'mongoose';
import { TSetting } from './setting.interface';

const settingSchema = new Schema<TSetting>(
  {
    description: { type: String, required: true },
  },
  { timestamps: true },
);

export const Setting = model<TSetting>('Setting', settingSchema);
