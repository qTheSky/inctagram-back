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
import { SharedModule } from '../shared/shared.module';
import { SubscribeToUserUseCase } from './application/use-cases/subscribe-to-user.use-case';
import { UserSubscriptionsRepository } from './infrastructure/user.subscriptions.repository';
import { UserSubscriptionEntity } from './entities/user-subscription.entity';

const adapters = [
  UsersRepository,
  UsersProfilesRepository,
  UsersQueryRepository,
  UserSubscriptionsRepository,
];

const useCases = [
  UpdateProfileUseCase,
  UploadUserAvatarUseCase,
  SubscribeToUserUseCase,
];

@Module({
  imports: [
    CqrsModule,
    FilesModule,
    SharedModule,
    TypeOrmModule.forFeature([
      UserEntity,
      UserEmailConfirmation,
      UserProfileEntity,
      UserPasswordRecoveryEntity,
      UserSubscriptionEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [...adapters, ...useCases],
  exports: [UsersRepository, UsersQueryRepository, UsersProfilesRepository],
})
export class UsersModule {}
