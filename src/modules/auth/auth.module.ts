import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { CqrsModule } from '@nestjs/cqrs';
import {
  IsCheckIsEmailConfirmedConstraint,
  IsConfirmationCodeValidConstraint,
  IsEmailOrUserNameUniqueConstraint,
} from './api/dto/input';
import { UsersModule } from '../users/users.module';
import {
  ConfirmEmailUseCase,
  GetAuthUserDataUseCase,
  LoginUseCase,
  LogoutUseCase,
  NewPasswordUseCase,
  PasswordRecoveryUseCase,
  RefreshTokenUseCase,
  RegistrationEmailResendingUseCase,
  RegistrationUseCase,
} from './application/use-cases';
import { AuthService } from './application/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as Joi from 'joi';
import { NotificationModule } from '../notification/notification.module';
import { SecurityModule } from '../security/security.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { GitHubStrategy } from './strategies/github.strategy';
import { SocialLoginUseCase } from './application/use-cases/social-login.use-case';

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
  SocialLoginUseCase,
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
        RECAPTCHA_SECRET_KEY: Joi.string().required(),
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
  exports: [AuthService],
})
export class AuthModule {}
