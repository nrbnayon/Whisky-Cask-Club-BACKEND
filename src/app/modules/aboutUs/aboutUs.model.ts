import { model, Schema } from 'mongoose';
import { TAbout } from './aboutUs.interface';

const aboutSchema = new Schema<TAbout>(
  {
    description: { type: String, required: true },
  },
  { timestamps: true },
);

export const About = model<TAbout>('About', aboutSchema);
