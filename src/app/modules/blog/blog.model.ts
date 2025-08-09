import { model, Schema } from 'mongoose';
import { IBlog } from './blog.interface';

// Create the Blog schema
const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    image: { type: String, required: false }, // Optional field
  },
  { timestamps: true }, // Add createdAt and updatedAt fields
);

// Create the Blog model
export const Blog = model<IBlog>('Blog', blogSchema);
