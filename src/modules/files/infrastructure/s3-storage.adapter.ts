import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3StorageAdapter {
  private s3Client: S3Client;
  private bucketName = this.configService.get('YANDEX_BUCKETNAME');

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: 'https://storage.yandexcloud.net',
      credentials: {
        secretAccessKey: this.configService.get('YANDEX_SECRET_ACCESS_KEY'),
        accessKeyId: this.configService.get('YANDEX_ACCESS_KEY_ID'),
      },
    });
  }

  async uploadFile(filePath: string, imageBuffer: Buffer) {
    const bucketParams = {
      Bucket: this.bucketName,
      Key: filePath,
      Body: imageBuffer,
      ContentType: 'image/png',
    };

    try {
      await this.s3Client.send(new PutObjectCommand(bucketParams));
      return {
        url: filePath,
      };
    } catch (exception) {
      console.error(exception);
      throw exception;
    }
  }

  async deleteFile(filePath: string) {
    const bucketParams = { Bucket: this.bucketName, Key: filePath };

    try {
      await this.s3Client.send(new DeleteObjectCommand(bucketParams));
    } catch (exception) {
      console.error(exception);
      throw exception;
    }
  }
}
