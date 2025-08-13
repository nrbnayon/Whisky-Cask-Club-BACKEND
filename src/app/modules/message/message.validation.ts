import { z } from "zod";

const createMessage = z.object({
  data: z.object({
    senderId: z
      .string()
      .min(24, "Sender ID is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Sender ID must be a valid ObjectId"),
    receiverId: z
      .string()
      .min(24, "Receiver ID is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Receiver ID must be a valid ObjectId"),
    message: z.string().optional(),
    
  }),
});

export const MessageValidation = {
  createMessage,
};
