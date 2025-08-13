import { Types } from "mongoose";
import { io, users } from "../socket";
import { MessageServices } from "../../app/modules/message/message.service";

export const handleSendMessage = async (data: {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message?: string;
  image?: string;
}) => {
  try {
    console.log(data);
    console.log(data.receiverId);

    // Validate required fields
    if (!data.senderId || !data.receiverId || (!data.message && !data.image)) {
      console.error("Invalid message data", data);
      return;
    }

    // Find the receiverSocketId by checking the users map structure
    let receiverSocketId;
    console.log("users", users);
    users.forEach((socketIds, userId) => {
      console.log({ userId }, socketIds);
      if (userId.toString() === data.receiverId.toString()) {
        // Take the first socket ID from the array if it exists
        if (socketIds && socketIds.length > 0) {
          receiverSocketId = socketIds[0];
        }
      }
    });
    console.log("receiverSocketId", receiverSocketId);

    // Create message in database first
    const savedMessage = await MessageServices.createMessage({
      sender: new Types.ObjectId(data.senderId),
      receiver: new Types.ObjectId(data.receiverId),
      message: data.message,
      image: data.image,
      isRead: false,
    });

    // Send to receiver if they are online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit(`receiver-${data.receiverId}`, {
        _id: savedMessage._id,
        senderId: data.senderId,
        receiverId: data.receiverId,
        message: data.message,
        image: data.image,
        isRead: false,
        createAt: savedMessage.createAt,
      });
    }

    // Send confirmation back to sender (find sender's socket)
    let senderSocketId;
    users.forEach((socketIds, userId) => {
      if (userId.toString() === data.senderId.toString()) {
        if (socketIds && socketIds.length > 0) {
          senderSocketId = socketIds[0];
        }
      }
    });

    if (senderSocketId) {
      io.to(senderSocketId).emit(`message-sent`, {
        _id: savedMessage._id,
        senderId: data.senderId,
        receiverId: data.receiverId,
        message: data.message,
        image: data.image,
        isRead: false,
        createAt: savedMessage.createAt,
        status: 'sent'
      });
    }

  } catch (error) {
    console.error("Error handling send message:", error);
  }
};
