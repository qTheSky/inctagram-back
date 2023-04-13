import { Module } from '@nestjs/common';
import { S3StorageAdapter } from './infrastructure/s3-storage.adapter';
import { FilesManager } from './application/files.manager';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string().required(),
      }),
    }),
  ],
  providers: [S3StorageAdapter, FilesManager],
  exports: [FilesManager],
})
export class FilesModule {}
