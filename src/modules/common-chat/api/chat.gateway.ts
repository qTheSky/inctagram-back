import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { credentials: true, origin: ['*', 'http://localhost:3001'] },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join')
  handleJoin(socket: Socket, room: string): void {
    socket.join(room);
    this.server.to(room).emit('message', {
      user: 'System',
      message: `${socket.id} has joined the room.`,
    });
  }

  @SubscribeMessage('message')
  handleMessage(
    socket: Socket,
    data: { room: string; user: string; message: string }
  ): void {
    this.server
      .to(data.room)
      .emit('message', { user: data.user, message: data.message });
  }

  @SubscribeMessage('leave')
  handleLeave(socket: Socket, room: string): void {
    this.server.to(room).emit('message', {
      user: 'System',
      message: `${socket.id} has left the room.`,
    });
    socket.leave(room);
  }
}
