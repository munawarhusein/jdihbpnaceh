import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { IStorageService } from './storage.interface';

@Injectable()
export class MinioService implements IStorageService, OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client: Minio.Client;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const cfg = this.configService.get('storage.minio');
    this.bucket = cfg.bucket;

    this.client = new Minio.Client({
      endPoint: cfg.endPoint,
      port: cfg.port,
      useSSL: cfg.useSSL,
      accessKey: cfg.accessKey,
      secretKey: cfg.secretKey,
    });

    await this.ensureBucketExists();
    this.logger.log(`MinIO terhubung — bucket: ${this.bucket}`);
  }

  private async ensureBucketExists(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket, 'us-east-1');
      this.logger.log(`Bucket '${this.bucket}' berhasil dibuat`);
    }

    try {
      // Set Policy jadi Public Read (Agar file bisa diakses langsung via Browser tanpa Token/Presigned)
      const policyContent = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
        ],
      };
      await this.client.setBucketPolicy(this.bucket, JSON.stringify(policyContent));
      this.logger.log(`Policy akses publik (s3:GetObject) berhasil diterapkan untuk bucket '${this.bucket}'`);
    } catch (e: any) {
      this.logger.error(`Gagal mengatur setBucketPolicy untuk bucket ${this.bucket}: ${e.message}`);
    }
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder = 'dokumen',
  ): Promise<string> {
    const ext = originalName.split('.').pop() || 'pdf';
    const objectName = `${folder}/${uuidv4()}.${ext}`;
    const size = buffer.length;

    await this.client.putObject(this.bucket, objectName, buffer, size, {
      'Content-Type': mimeType,
      'Original-Name': encodeURIComponent(originalName),
    });

    // Return URL publik
    const endpoint = this.configService.get('storage.minio.endPoint');
    const port = this.configService.get('storage.minio.port');
    const useSSL = this.configService.get('storage.minio.useSSL');
    const protocol = useSSL ? 'https' : 'http';

    return `${protocol}://${endpoint}:${port}/${this.bucket}/${objectName}`;
  }

  async delete(fileUrl: string): Promise<void> {
    const objectName = this.extractObjectName(fileUrl);
    if (!objectName) return;
    await this.client.removeObject(this.bucket, objectName);
    this.logger.log(`File dihapus: ${objectName}`);
  }

  async getStream(fileUrl: string): Promise<Readable> {
    const objectName = this.extractObjectName(fileUrl);
    return this.client.getObject(this.bucket, objectName);
  }

  async getPresignedUrl(fileUrl: string, expirySecs = 3600): Promise<string> {
    const objectName = this.extractObjectName(fileUrl);
    return this.client.presignedGetObject(this.bucket, objectName, expirySecs);
  }

  private extractObjectName(fileUrl: string): string {
    // Extract path setelah bucket name
    const parts = fileUrl.split(`/${this.bucket}/`);
    return parts.length > 1 ? parts[1] : fileUrl;
  }
}
