import { Injectable } from '@nestjs/common';
import { S3StorageAdapter } from '../infrastructure/s3-storage.adapter';

@Injectable()
export class FilesManager {
  constructor(private s3StorageAdapter: S3StorageAdapter) {}

  async uploadFile(
    filePath: string,
    imageBuffer: Buffer
  ): Promise<{ url: string }> {
    return await this.s3StorageAdapter.uploadFile(filePath, imageBuffer);
  }

  async deleteFile(filePath: string) {
    await this.s3StorageAdapter.deleteFile(filePath);
  }
}
