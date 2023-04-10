import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { IsEmailOrUserNameUniqueConstraint } from './api/dto/input/register.dto';
import { UsersModule } from '../users/users.module';
import { RegistrationUseCase } from './application/use-cases/registration.use-case';
import { AuthService } from './application/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as Joi from 'joi';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { NotificationModule } from '../notification/notification.module';
import { IsConfirmationCodeValidConstraint } from './api/dto/input/email-confirm.dto';
import { ConfirmEmailUseCase } from './application/use-cases/confirm-email.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { SecurityModule } from '../security/security.module';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { GetAuthUserDataUseCase } from './application/use-cases/get-auth-user-data.use-case';
import {
  NewPasswordUseCase,
  PasswordRecoveryUseCase,
  RegistrationEmailResendingUseCase,
} from './application/use-cases';
import { IsCheckIsEmailConfirmedConstraint } from './api/dto/input';

const validationConstraints = [
  IsEmailOrUserNameUniqueConstraint,
  IsConfirmationCodeValidConstraint,
  IsCheckIsEmailConfirmedConstraint,
];

const useCases = [
  RegistrationUseCase,
  LoginUseCase,
  ConfirmEmailUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  GetAuthUserDataUseCase,
  NewPasswordUseCase,
  PasswordRecoveryUseCase,
  RegistrationEmailResendingUseCase,
];
const services = [AuthService];
const authStrategies = [JwtStrategy, LocalStrategy];

@Module({
  imports: [
    SecurityModule,
    NotificationModule,
    CqrsModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        ACCESS_TOKEN_TIME: Joi.string().required(),
      }),
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('ACCESS_TOKEN_TIME') },
      }),
    }),
  ],
  providers: [
    ...validationConstraints,
    ...useCases,
    ...services,
    ...authStrategies,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
