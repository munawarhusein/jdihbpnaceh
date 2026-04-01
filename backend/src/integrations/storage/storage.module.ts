import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioService } from './minio.service';
import { STORAGE_SERVICE } from './storage.interface';

@Module({
  imports: [ConfigModule],
  providers: [
    MinioService,
    {
      provide: STORAGE_SERVICE,
      useClass: MinioService,
    },
  ],
  exports: [STORAGE_SERVICE, MinioService],
})
export class StorageModule {}
