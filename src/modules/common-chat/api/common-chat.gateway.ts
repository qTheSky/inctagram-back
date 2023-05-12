import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../../auth/application/auth.service';

@WebSocketGateway({
  cors: { credentials: true, origin: ['*', 'http://localhost:3001'] },
})
export class CommonChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  commonChatRoomName = 'common-chat';
  constructor(private authService: AuthService) {}

  async handleConnection(socket: Socket): Promise<void> {
    const unauthorizedEvent = () => {
      socket.emit('unauthorized', {
        message: 'You are unauthorized',
      });
    };

    const token =
      socket.handshake.query.token || socket.handshake.headers.authorization;
    if (!token) {
      unauthorizedEvent();
      socket.disconnect();
      return;
    }
    try {
      const userTokenPayload = await this.authService.validateToken(
        token as string
      );
      if (userTokenPayload) {
        socket.user = userTokenPayload;
      } else {
        unauthorizedEvent();
        socket.disconnect();
      }
    } catch (e) {
      unauthorizedEvent();
      socket.disconnect();
    }
  }

  @SubscribeMessage('join')
  handleJoin(socket: Socket): void {
    socket.join(this.commonChatRoomName);
    this.server.to(this.commonChatRoomName).emit('message', {
      userName: 'System',
      message: `${socket.user.login} has joined the room.`,
    });
  }

  @SubscribeMessage('message')
  handleMessage(socket: Socket, data: { message: string }): void {
    this.server.to(this.commonChatRoomName).emit('message', {
      userName: socket.user.login,
      userId: socket.user.userId,
      message: data.message,
    });
  }

  @SubscribeMessage('leave')
  handleLeave(socket: Socket, room: string): void {
    this.server.to(room).emit('message', {
      user: 'System',
      message: `${socket.user.login} has left the room.`,
    });
    socket.leave(room);
  }
}
