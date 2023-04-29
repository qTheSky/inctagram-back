import { Module } from '@nestjs/common';
import { CommonChatGateway } from './api/common-chat.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [CommonChatGateway],
})
export class CommonChatModule {}
