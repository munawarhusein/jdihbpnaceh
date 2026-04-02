import { Module } from '@nestjs/common';
import { PenggunaService } from './pengguna.service';
import { PenggunaController } from './pengguna.controller';
import { ProfilService } from './profil.service';
import { ProfilController } from './profil.controller';

@Module({
  controllers: [PenggunaController, ProfilController],
  providers: [PenggunaService, ProfilService],
  exports: [PenggunaService, ProfilService],
})
export class PenggunaModule {}
