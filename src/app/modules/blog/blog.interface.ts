import { Types } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  description: string;
  author: Types.ObjectId;
  date: Date;
  image?: string;
}
