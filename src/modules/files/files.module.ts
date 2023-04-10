import { Module } from '@nestjs/common';
import { S3StorageAdapter } from './infrastructure/s3-storage.adapter';
import { FilesManager } from './application/files.manager';

@Module({
  providers: [S3StorageAdapter, FilesManager],
  exports: [FilesManager],
})
export class FilesModule {}
