import { Server } from 'socket.io';
import { handleSendMessage } from './userMessage/message';
import { Message } from '../app/modules/message/message.model';
import { onlineStatusService } from '../app/modules/onlineStatus/onlineStatus.service';
import { activityLogService } from '../app/modules/activityLog/activityLog.service';
import { logger } from '../shared/logger';

export const users = new Map<string, string[]>(); // Map to store userId -> [socketIds]
export const activeChatUsers = new Map<string, string>(); // Map to track active chat sessions

let io: Server; // Store io instance globally

const setupSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: ['*', 'http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', socket => {
    console.log('New user connected:', socket.id);

    // User registration - associate socket with userId
    socket.on('register', async userId => {
      const existingSockets = users.get(userId) || [];
      users.set(userId, [...existingSockets, socket.id]);
      console.log('Online users:', Array.from(users.keys()));

      // Set user online
      await onlineStatusService.setUserOnline(userId);
      
      // Log activity
      await activityLogService.logActivity(userId, 'LOGIN', 'AUTH', {
        socketId: socket.id,
        timestamp: new Date(),
      });

      // Broadcast updated online users list
      io.emit('onlineUsers', Array.from(users.keys()));
    });

    // Track active chat sessions
    socket.on('activeChat', data => {
      console.log('Active chat:', data);
      if (data.senderId) {
        activeChatUsers.set(data.receiverId, data.senderId);
      } else {
        activeChatUsers.delete(data.receiverId);
      }
    });

    // Handle sending messages
    socket.on('sendMessage', async data => {
      try {
        console.log('Send message:', data);

        // Validate message data
        if (
          !data.senderId ||
          !data.receiverId ||
          (!data.message && !data.image)
        ) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        // Call external handler for message processing
        await handleSendMessage(data);
      } catch (error) {
        console.error('Error in sendMessage:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('markAsRead', async data => {
      try {
        console.log('Mark as read:', data);
        const { senderId, receiverId } = data;

        if (senderId && receiverId) {
          // Update messages to read status
          await Message.updateMany(
            { sender: senderId, receiver: receiverId, isRead: false },
            { $set: { isRead: true } },
          );

          // Find sender's socket and notify them
          const senderSockets = users.get(senderId);
          if (senderSockets && senderSockets.length > 0) {
            io.to(senderSockets[0]).emit('messages-read', {
              senderId,
              receiverId,
              isRead: true,
            });
          }
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Handle typing indicators
    socket.on('typing', data => {
      const { senderId, receiverId } = data;
      const receiverSockets = users.get(receiverId);

      if (receiverSockets) {
        receiverSockets.forEach((socketId: string) => {
          io.to(socketId).emit('userTyping', { userId: senderId });
        });
      }
    });

    socket.on('stopTyping', data => {
      const { senderId, receiverId } = data;
      const receiverSockets = users.get(receiverId);

      if (receiverSockets) {
        receiverSockets.forEach((socketId: string) => {
          io.to(socketId).emit('userStoppedTyping', { userId: senderId });
        });
      }
    });

    // Handle user disconnect
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);

      let disconnectedUserId: string | null = null;

      // Remove socket from users map
      users.forEach((socketIds, userId) => {
        const updatedSockets = socketIds.filter(
          (id: string) => id !== socket.id,
        );
        if (updatedSockets.length > 0) {
          users.set(userId, updatedSockets);
        } else {
          // No more sockets for this user, remove from maps
          disconnectedUserId = userId;
          users.delete(userId);
          activeChatUsers.delete(userId);
        }
      });

      // Set user offline if no more sockets
      if (disconnectedUserId) {
        await onlineStatusService.setUserOffline(disconnectedUserId);
        
        // Log activity
        await activityLogService.logActivity(disconnectedUserId, 'LOGOUT', 'AUTH', {
          socketId: socket.id,
          timestamp: new Date(),
        });
      }

      // Broadcast updated online users list
      io.emit('onlineUsers', Array.from(users.keys()));
    });

    // Handle heartbeat for keeping users online
    socket.on('heartbeat', async (userId) => {
      if (userId) {
        await onlineStatusService.updateUserActivity(userId);
      }
    });
  });

  return io;
};

// Helper function to emit message to specific user
export const emitToUser = (userId: string, event: string, data: any) => {
  const userSockets = users.get(userId);
  if (userSockets) {
    userSockets.forEach((socketId: string) => {
      io.to(socketId).emit(event, data);
    });
  }
};

// Helper function to check if user is online
export const isUserOnline = (userId: string): boolean => {
  return users.has(userId);
};

// Helper function to get online users count
export const getOnlineUsersCount = (): number => {
  return users.size;
};

export { setupSocket, io };
