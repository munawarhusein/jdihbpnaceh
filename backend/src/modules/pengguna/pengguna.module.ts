import { Module } from '@nestjs/common';
import { PenggunaService } from './pengguna.service';
import { PenggunaController } from './pengguna.controller';

@Module({
  controllers: [PenggunaController],
  providers: [PenggunaService],
  exports: [PenggunaService],
})
export class PenggunaModule {}
