import { Model, Types } from "mongoose";

export type TMessage = {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  message?: string | null;
  image?: string | null;
  isRead?: boolean;
  createAt: Date;
  updateAt: Date;
  senderId?: string;
  receiverId?: string;
};

export namespace TReturnMessage {
  export type Meta = {
    page: number;
    limit: number;
    totalPage: number;
    total: number;
    [key: string]:unknown
  };

  export type getAllMessage = {
    result: TMessage[];
    meta?: Meta;
  };

  export type getSingleMessage = TMessage;
  export type updateMessage = TMessage;
  export type updateMessageActivationStatus = TMessage;

  export type updateMessageRole = TMessage;

  export type deleteMessage = TMessage;
}
