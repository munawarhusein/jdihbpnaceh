import { Module, Global } from '@nestjs/common';
import { DeepseekService } from './deepseek.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DeepseekService],
  exports: [DeepseekService],
})
export class AiModule {}
