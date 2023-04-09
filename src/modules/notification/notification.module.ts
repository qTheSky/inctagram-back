import { Module } from '@nestjs/common';
import { EmailAdapter } from './infrastructure/email.adapter';
import { EmailsManager } from './application/emails.manager';

@Module({
  providers: [EmailAdapter, EmailsManager],
  exports: [EmailAdapter, EmailsManager],
})
export class NotificationModule {}
