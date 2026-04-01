import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DokumenController } from './dokumen.controller';
import { DokumenService } from './dokumen.service';
import { StorageModule } from '../../integrations/storage/storage.module';
import { ElasticsearchIntegrationModule } from '../../integrations/elasticsearch/elasticsearch.module';
import { OCR_QUEUE, INDEXING_QUEUE } from '../../queue/ocr.processor';

@Module({
  imports: [
    StorageModule,
    ElasticsearchIntegrationModule,
    BullModule.registerQueue(
      { name: OCR_QUEUE },
      { name: INDEXING_QUEUE },
    ),
  ],
  controllers: [DokumenController],
  providers: [DokumenService],
  exports: [DokumenService],
})
export class DokumenModule {}
