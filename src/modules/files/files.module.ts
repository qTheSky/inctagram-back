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
        YANDEX_SECRET_ACCESS_KEY: Joi.string().required(),
        YANDEX_ACCESS_KEY_ID: Joi.string().required(),
        YANDEX_BUCKETNAME: Joi.string().required(),
        FILES_URL: Joi.string().required(),
      }),
    }),
  ],
  providers: [S3StorageAdapter, FilesManager],
  exports: [FilesManager],
})
export class FilesModule {}
