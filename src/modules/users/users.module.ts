import { Module } from '@nestjs/common';
import { UsersRepository } from './infrastructure/users.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserEmailConfirmation } from './entities/user-email-confirmation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserEmailConfirmation])],
  providers: [UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
