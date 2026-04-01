import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OcrProcessor, OCR_QUEUE, INDEXING_QUEUE } from './ocr.processor';
import { IndexingProcessor } from './indexing.processor';
import { ElasticsearchIntegrationModule } from '../integrations/elasticsearch/elasticsearch.module';
import { StorageModule } from '../integrations/storage/storage.module';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: OCR_QUEUE,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 50 },
        },
      },
      {
        name: INDEXING_QUEUE,
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'fixed', delay: 2000 },
          removeOnComplete: { count: 200 },
        },
      },
    ),
    ElasticsearchIntegrationModule,
    StorageModule,
  ],
  providers: [OcrProcessor, IndexingProcessor],
  exports: [BullModule],
})
export class QueueModule {}
