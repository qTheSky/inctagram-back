import { Module } from '@nestjs/common';
import { UsersRepository } from './infrastructure/users.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './api/users.controller';

import { UsersProfilesRepository } from './infrastructure/users.profiles.repository';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersQueryRepository } from './infrastructure';
import {
  UserBanInfoEntity,
  UserEmailConfirmation,
  UserEntity,
  UserPasswordRecoveryEntity,
  UserProfileEntity,
} from './entities';

const adapters = [
  UsersRepository,
  UsersProfilesRepository,
  UsersQueryRepository,
];

const useCases = [UpdateProfileUseCase];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      UserEntity,
      UserEmailConfirmation,
      UserProfileEntity,
      UserBanInfoEntity,
      UserPasswordRecoveryEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [...adapters, ...useCases],
  exports: [UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
