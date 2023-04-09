import { Module } from '@nestjs/common';
import { UsersRepository } from './infrastructure/users.repository';

@Module({
  providers: [UsersRepository],
  exports: [],
})
export class UsersModule {}
