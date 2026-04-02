import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Configs
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { redisConfig } from './config/redis.config';
import { elasticsearchConfig } from './config/elasticsearch.config';
import { storageConfig } from './config/storage.config';
import { ocrConfig } from './config/ocr.config';

// Core Modules
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';

// Feature Modules
import { DokumenModule } from './modules/dokumen/dokumen.module';
import { PencarianModule } from './modules/pencarian/pencarian.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ApprovalModule } from './modules/approval/approval.module';

// Integration Modules
import { StorageModule } from './integrations/storage/storage.module';
import { ElasticsearchIntegrationModule } from './integrations/elasticsearch/elasticsearch.module';
import { AiModule } from './integrations/ai/ai.module';

// Queue
import { QueueModule } from './queue/queue.module';

// Common
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { KategoriModule } from './modules/kategori/kategori.module';
import { PenggunaModule } from './modules/pengguna/pengguna.module';

@Module({
  imports: [
    // Config (global)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, elasticsearchConfig, storageConfig, ocrConfig],
      envFilePath: ['.env', '.env.local'],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL', 60) * 1000,
          limit: config.get('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    // BullMQ (Redis connection)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD') || undefined,
        },
      }),
    }),

    // Core
    DatabaseModule,
    AuthModule,

    // Features
    DokumenModule,
    PencarianModule,
    AnalyticsModule,
    ApprovalModule,

    // Integrations
    StorageModule,
    ElasticsearchIntegrationModule,
    AiModule,

    // Queue Workers
    QueueModule,

    KategoriModule,

    PenggunaModule,
  ],
  providers: [
    // Global Exception Filter
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },

    // Global Response Interceptor
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },

    // Global Guards (JWT + Roles)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
