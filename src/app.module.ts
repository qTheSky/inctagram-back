import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getTypeOrmConfig } from './config/typeorm.config';
import { SharedModule } from './modules/shared/shared.module';
import * as Joi from 'joi';
import { ThrottlerModule } from '@nestjs/throttler';
import { NotificationModule } from './modules/notification/notification.module';
import { SecurityModule } from './modules/security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        HOST: Joi.string().required(),
        PORT: Joi.string().required(),
        DATABASEUSERNAME: Joi.string().required(),
        PASSWORD: Joi.string().required(),
        DATABASE: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 60,
      // skipIf: (context) => {
      //   return (context.getType() as string) === 'telegraf'; //skip throttler if request from telegram
      // },
    }), //ttl - seconds, limit - requests per ttl
    AuthModule,
    UsersModule,
    SharedModule,
    NotificationModule,
    SecurityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
