/* eslint-disable no-console */
import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';

const socket = (io: Server) => {
  io.on('connection', socket => {
    console.log('A user connected:', socket.id);

    // Join a chat room
    socket.on('join', roomId => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    // socket.on('send-message', async ({ roomId, senderId, message }) => {
    //   try {
    //     // Save the message to the database
    //     const newMessage = await Message.create({
    //       roomId,
    //       senderId,
    //       message,
    //     });

    //     // Populate the senderId field
    //     const populatedMessage = await newMessage.populate(
    //       'senderId',
    //       'name email image',
    //     );

    //     // Emit the message to all users in the specified chat room
    //     io.emit(`receive-message:${populatedMessage.roomId}`, populatedMessage);
    //   } catch (error) {
    //     console.error('Error sending message:', error);
    //   }
    // });

    // // Listen for the chat-started event and emit to the specific room
    // socket.on('chat-started', ({ chatRoom }) => {
    //   io.to(chatRoom).emit(`chat-started:${chatRoom}`, {
    //     chatRoom,
    //     message: 'Chat started between the groups.',
    //   });
    // });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect'));
    });
  });
};

export default socket;

export const socketHelper = { socket };
