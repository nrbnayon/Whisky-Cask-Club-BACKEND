import { model, Schema } from 'mongoose';
import { INewsLetter } from './newsLetter.interface';

const newsLetterSchema = new Schema<INewsLetter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const NewsLetter = model<INewsLetter>('NewsLetter', newsLetterSchema);
