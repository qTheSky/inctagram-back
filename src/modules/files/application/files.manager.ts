import { Injectable } from '@nestjs/common';
import { S3StorageAdapter } from '../infrastructure/s3-storage.adapter';
import { S3MinioStorageAdapter } from '../infrastructure/s3-minio.adapter';

@Injectable()
export class FilesManager {
  constructor(
    private s3StorageAdapter: S3StorageAdapter,
    private s3MinioStorageAdapter: S3MinioStorageAdapter
  ) {}

  async uploadFile(
    filePath: string,
    imageBuffer: Buffer
  ): Promise<{ url: string }> {
    //return await this.s3StorageAdapter.uploadFile(filePath, imageBuffer);
    return await this.s3MinioStorageAdapter.uploadFile(filePath, imageBuffer);
  }

  async deleteFile(filePath: string) {
    //await this.s3StorageAdapter.deleteFile(filePath);
    await this.s3MinioStorageAdapter.deleteFile(filePath);
  }
}
