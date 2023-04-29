import { Module } from '@nestjs/common';
import { ChatGateway } from './api/chat.gateway';

@Module({
  providers: [ChatGateway],
})
export class CommonChatModule {}
