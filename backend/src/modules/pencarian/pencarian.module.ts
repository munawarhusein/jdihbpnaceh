import { Module } from '@nestjs/common';
import { PencarianController } from './pencarian.controller';
import { ElasticsearchIntegrationModule } from '../../integrations/elasticsearch/elasticsearch.module';

@Module({
  imports: [ElasticsearchIntegrationModule],
  controllers: [PencarianController],
})
export class PencarianModule {}
