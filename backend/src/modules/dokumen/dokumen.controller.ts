import {
  Controller, Get, Post, Delete, Param, Query, Body,
  UseGuards, UseInterceptors, UploadedFile, ParseFilePipe,
  FileTypeValidator, MaxFileSizeValidator, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DokumenService } from './dokumen.service';
import { BuatDokumenDto } from './dto/buat-dokumen.dto';
import { FilterDokumenDto } from './dto/filter-dokumen.dto';
import { PeranPengguna } from '@prisma/client';

@Controller('dokumen')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DokumenController {
  constructor(private readonly dokumenService: DokumenService) {}

  /** GET /dokumen — Daftar dokumen (publik) */
  @Public()
  @Get()
  async daftarDokumen(@Query() filter: FilterDokumenDto) {
    return this.dokumenService.cariDenganFilter(filter);
  }

  /** GET /dokumen/:id — Detail dokumen (publik) */
  @Public()
  @Get(':id')
  async dapatkanDokumen(@Param('id') id: string) {
    return this.dokumenService.dapatkanSatu(id);
  }

  /** POST /dokumen/unggah — Upload dokumen (admin/pengelola) */
  @Post('unggah')
  @Roles(PeranPengguna.admin, PeranPengguna.pengelola)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  async unggahDokumen(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'application/pdf' }),
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: BuatDokumenDto,
    @CurrentUser('email') email: string,
  ) {
    return this.dokumenService.uploadDanBuat(file, dto, email);
  }

  /** DELETE /dokumen/:id — Hapus dokumen (soft delete, admin only) */
  @Delete(':id')
  @Roles(PeranPengguna.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async hapusDokumen(@Param('id') id: string) {
    return this.dokumenService.hapusSoft(id);
  }

  /** POST /dokumen/:id/reindex — Re-index ke Elasticsearch */
  @Post(':id/reindex')
  @Roles(PeranPengguna.admin)
  async reindexDokumen(@Param('id') id: string) {
    await this.dokumenService.reindex(id);
    return { pesan: 'Dokumen dijadwalkan untuk re-index' };
  }
}
