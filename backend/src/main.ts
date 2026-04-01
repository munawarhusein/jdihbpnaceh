import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Patching BigInt agar dapat di-serialize oleh JSON.stringify
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Hapus field yang tidak ada di DTO
      forbidNonWhitelisted: false,
      transform: true,           // Auto-transform query params ke tipe yang benar
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: false,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 JDIH BPN Aceh API berjalan di: http://localhost:${port}/api/v1`);
  logger.log(`📄 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
