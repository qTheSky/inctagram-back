import { Module } from '@nestjs/common';
import { UsersRepository } from './infrastructure/users.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserEmailConfirmation } from './entities/user-email-confirmation.entity';
import { UsersController } from './api/users.controller';
import { UserProfileEntity } from './entities/user-profile.entity';
import { UsersProfilesRepository } from './infrastructure/users.profiles.repository';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { CqrsModule } from '@nestjs/cqrs';

const adapters = [UsersRepository, UsersProfilesRepository];

const useCases = [UpdateProfileUseCase];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      UserEntity,
      UserEmailConfirmation,
      UserProfileEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [...adapters, ...useCases],
  exports: [UsersRepository],
})
export class UsersModule {}
