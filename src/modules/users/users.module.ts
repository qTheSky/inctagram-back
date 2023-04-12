import { Module } from '@nestjs/common';
import { UsersRepository } from './infrastructure';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './api/users.controller';

import { UsersProfilesRepository } from './infrastructure';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersQueryRepository } from './infrastructure';
import {
  UserEmailConfirmation,
  UserEntity,
  UserPasswordRecoveryEntity,
  UserProfileEntity,
} from './entities';
import { UploadUserAvatarUseCase } from './application/use-cases/upload-user-avatar.use-case';
import { FilesModule } from '../files/files.module';

const adapters = [
  UsersRepository,
  UsersProfilesRepository,
  UsersQueryRepository,
];

const useCases = [UpdateProfileUseCase, UploadUserAvatarUseCase];

@Module({
  imports: [
    CqrsModule,
    FilesModule,
    TypeOrmModule.forFeature([
      UserEntity,
      UserEmailConfirmation,
      UserProfileEntity,
      // UserBanInfoEntity,
      UserPasswordRecoveryEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [...adapters, ...useCases],
  exports: [UsersRepository, UsersQueryRepository, UsersProfilesRepository],
})
export class UsersModule {}
