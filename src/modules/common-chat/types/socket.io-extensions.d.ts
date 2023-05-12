import { Socket } from 'socket.io';
// DONT DELETE IMPORT Socket!!!!

declare module 'socket.io' {
  interface Socket {
    user: { userId: string; login: string };
  }
}
