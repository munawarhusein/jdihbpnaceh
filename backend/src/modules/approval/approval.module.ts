import { Module } from '@nestjs/common';
import { ApprovalController } from './approval.controller';
import { ApprovalService } from './approval.service';
import { StorageModule } from '../../integrations/storage/storage.module';
import { ElasticsearchIntegrationModule } from '../../integrations/elasticsearch/elasticsearch.module';

@Module({
  imports: [StorageModule, ElasticsearchIntegrationModule],
  controllers: [ApprovalController],
  providers: [ApprovalService],
  exports: [ApprovalService],
})
export class ApprovalModule {}
