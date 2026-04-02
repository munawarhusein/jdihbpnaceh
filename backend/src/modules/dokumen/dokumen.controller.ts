import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body, Res,
  UseGuards, UseInterceptors, UploadedFile, ParseFilePipe,
  FileTypeValidator, MaxFileSizeValidator, HttpCode, HttpStatus, Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DokumenService } from './dokumen.service';
import { BuatDokumenDto } from './dto/buat-dokumen.dto';
import { EditDokumenDto } from './dto/edit-dokumen.dto';
import { FilterDokumenDto } from './dto/filter-dokumen.dto';
import { PeranPengguna } from '@prisma/client';

@Controller('dokumen')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DokumenController {
  constructor(private readonly dokumenService: DokumenService) {}

  /** GET /dokumen — Daftar dokumen publik (tanpa sensitif) */
  @Public()
  @Get()
  async daftarDokumen(@Query() filter: FilterDokumenDto) {
    return this.dokumenService.cariDenganFilter(filter);
  }

  /** GET /dokumen/admin — Daftar semua dokumen untuk admin (termasuk sensitif) */
  @Get('admin')
  @Roles(PeranPengguna.superadmin, PeranPengguna.admin, PeranPengguna.pengelola)
  async daftarDokumenAdmin(@Query() filter: FilterDokumenDto) {
    return this.dokumenService.daftarSemua(filter);
  }

  /** GET /dokumen/:id — Detail dokumen (publik) */
  @Public()
  @Get(':id')
  async dapatkanDokumen(@Param('id') id: string) {
    return this.dokumenService.dapatkanSatu(id);
  }

  /** GET /dokumen/:id/berkas — Akses file PDF secara aman (streaming dari MinIO) */
  @Get(':id/berkas')
  @Roles(PeranPengguna.superadmin, PeranPengguna.admin, PeranPengguna.pengelola)
  async aksesberkas(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    // Ambil NIP user dari database
    const pengguna = await this.dokumenService['prisma'].pengguna.findUnique({
      where: { id: user.sub },
      select: { nip: true, peran: true },
    });

    const { stream, namaFile, mimeType } = await this.dokumenService.getBerkas(id, {
      nip: pengguna?.nip || undefined,
      peran: pengguna?.peran || user.peran,
    });

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(namaFile)}"`,
    });

    stream.pipe(res);
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

  /** PATCH /dokumen/:id — Edit metadata dokumen (admin/pengelola) */
  @Patch(':id')
  @Roles(PeranPengguna.superadmin, PeranPengguna.admin, PeranPengguna.pengelola)
  async editDokumen(
    @Param('id') id: string,
    @Body() dto: EditDokumenDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dokumenService.editDokumen(id, dto, userId);
  }

  /** DELETE /dokumen/:id — Hapus dokumen (admin / superadmin) */
  @Delete(':id')
  @Roles(PeranPengguna.superadmin, PeranPengguna.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async hapusDokumen(@Param('id') id: string, @CurrentUser() user: any) {
    return this.dokumenService.hapusSoft(id, user);
  }

  /** POST /dokumen/:id/reindex — Re-index ke Elasticsearch */
  @Post(':id/reindex')
  @Roles(PeranPengguna.admin)
  async reindexDokumen(@Param('id') id: string) {
    await this.dokumenService.reindex(id);
    return { pesan: 'Dokumen dijadwalkan untuk re-index' };
  }
}
