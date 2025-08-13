import { QueryBuilder } from "../../builder/QueryBuilder";
import { TMessage } from "./message.interface";
import { Message } from "./message.model";

const createMessage = async (payload: Partial<TMessage>) => {
  if (!payload.sender || !payload.receiver) {
    throw new Error("sender and receiver are required");
  }
  const result = await Message.create(payload);
  return result;
};

const createMessageWithImage = async (payload: Partial<TMessage>) => {
  const result = await Message.create(payload);
  return result;
};

const getAllMessage = async (query: Record<string, any>) => {
  const { sender, receiver } = query;

    const messageQuery = new QueryBuilder(
      Message.find({
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender }
        ]
      })
        .populate("sender", "firstName lastName image")
        .populate("receiver", "firstName lastName image"),
      query
    )
      .search(["message"])
      .filter()
      .sort()
      .paginate()
      .fields();

    const result = await messageQuery.modelQuery;
    const meta = await messageQuery.countTotal();

    return { result, meta };

};

export const MessageServices = {
  createMessage,
  createMessageWithImage,
  getAllMessage,
};
