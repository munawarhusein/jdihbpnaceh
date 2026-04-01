import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../database/prisma.service';
import { ElasticsearchService } from '../../integrations/elasticsearch/elasticsearch.service';
import { PeranPengguna } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearch: ElasticsearchService,
  ) {}

  /** GET /analytics/ringkasan — Statistik publik */
  @Public()
  @Get('ringkasan')
  async ringkasan() {
    const [total, perStatus, perJenis] = await Promise.all([
      this.prisma.dokumen.count({ where: { dihapus_pada: null } }),
      this.prisma.dokumen.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { dihapus_pada: null },
      }),
      this.prisma.dokumen.groupBy({
        by: ['jenis'],
        _count: { id: true },
        where: { dihapus_pada: null, status: 'aktif' },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      total_dokumen: total,
      per_status: perStatus.map((s) => ({ status: s.status, jumlah: s._count.id })),
      per_jenis: perJenis.map((j) => ({ jenis: j.jenis, jumlah: j._count.id })),
    };
  }

  /** GET /analytics/per-tahun — Dokumen per tahun */
  @Public()
  @Get('per-tahun')
  async perTahun() {
    const data = await this.prisma.dokumen.groupBy({
      by: ['tahun'],
      _count: { id: true },
      where: { dihapus_pada: null, status: 'aktif' },
      orderBy: { tahun: 'desc' },
    });

    return data.map((d) => ({ tahun: d.tahun, jumlah: d._count.id }));
  }

  /** GET /analytics/ocr-status — Status OCR (admin only) */
  @Get('ocr-status')
  @Roles(PeranPengguna.admin, PeranPengguna.pengelola)
  async statusOcr() {
    const data = await this.prisma.dokumen.groupBy({
      by: ['status_ocr'],
      _count: { id: true },
      where: { dihapus_pada: null },
    });

    return data.map((d) => ({ status_ocr: d.status_ocr, jumlah: d._count.id }));
  }
}
