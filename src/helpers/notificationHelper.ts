/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-undef */

// import { Notification } from '../app/modules/notifications/notifications.model';

// export const sendNotifications = async (data: any) => {
//   const result = await Notification.create(data);

//   //@ts-ignore
//   const socketIo = global.io;

//   if (data?.type === 'ADMIN') {
//     socketIo.emit(`get-notification::${data?.type}`, result);
//   } else {
//     socketIo.emit(`get-notification::${data?.receiver}`, result);
//   }

//   return result;
// };
