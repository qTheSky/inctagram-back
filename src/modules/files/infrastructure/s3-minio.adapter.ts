import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as Minio from 'minio';
@Injectable()
export class S3MinioStorageAdapter {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT'),
      port: Number(this.configService.get('MINIO_PORT')),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SECRET_KEY'),
    });
    this.bucketName = this.configService.get('MINIO_BUCKET_NAME');
  }

  async createBucketIfNotExists(): Promise<void> {
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
    }
  }

  async uploadFile(fileName: string, file: Buffer) {
    const metaData = {
      'Content-Type': 'image/png',
    };

    console.log(fileName);

    try {
      const fileResult = await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file,
        file.length,
        metaData
      );
      return {
        url: fileName,
      };
    } catch (exception) {
      console.error(exception);
      throw exception;
    }
  }

  async getStatic(fileName: string) {
    return this.minioClient.getObject(this.bucketName, fileName);
  }

  async deleteFile(fileName: string) {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }
}
