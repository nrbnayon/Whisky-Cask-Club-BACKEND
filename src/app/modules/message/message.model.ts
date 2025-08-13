import { model, Schema } from "mongoose";

import { TMessage } from "./message.interface";
const messageSchema = new Schema<TMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
    },
    image: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// this for better index performance
messageSchema.index({ createdAt: -1 });

export const Message = model<TMessage>("Message", messageSchema);
