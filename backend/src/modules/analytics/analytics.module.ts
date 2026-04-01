import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { ElasticsearchIntegrationModule } from '../../integrations/elasticsearch/elasticsearch.module';

@Module({
  imports: [ElasticsearchIntegrationModule],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
