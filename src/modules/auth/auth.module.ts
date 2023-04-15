import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { IsEmailOrUserNameUniqueConstraint } from './api/dto/input';
import { UsersModule } from '../users/users.module';
import { RegistrationUseCase } from './application/use-cases';
import { AuthService } from './application/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as Joi from 'joi';
import { LoginUseCase } from './application/use-cases';
import { NotificationModule } from '../notification/notification.module';
import { IsConfirmationCodeValidConstraint } from './api/dto/input';
import { ConfirmEmailUseCase } from './application/use-cases';
import { RefreshTokenUseCase } from './application/use-cases';
import { SecurityModule } from '../security/security.module';
import { LogoutUseCase } from './application/use-cases';
import { GetAuthUserDataUseCase } from './application/use-cases';
import {
  NewPasswordUseCase,
  PasswordRecoveryUseCase,
  RegistrationEmailResendingUseCase,
} from './application/use-cases';
import { IsCheckIsEmailConfirmedConstraint } from './api/dto/input';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleLoginUseCase } from './application/use-cases/google-login.use-case';
import { GitHubLoginUseCase } from './application/use-cases/github-login.use-case';
import { GitHubStrategy } from './strategies/github.strategy';

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
  GoogleLoginUseCase,
  GitHubLoginUseCase,
];
const services = [AuthService];
const authStrategies = [
  JwtStrategy,
  LocalStrategy,
  GoogleStrategy,
  GitHubStrategy,
];

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
        REFRESH_TOKEN_TIME: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string().required(),
        GITHUB_CLIENT_ID: Joi.string().required(),
        GITHUB_CLIENT_SECRET: Joi.string().required(),
        GITHUB_CALLBACK_URL: Joi.string().required(),
      }),
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: { expiresIn: configService.get("ACCESS_TOKEN_TIME") },
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
