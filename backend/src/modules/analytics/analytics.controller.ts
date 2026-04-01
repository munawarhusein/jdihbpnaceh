import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PeranPengguna } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('ringkasan')
  @Roles(PeranPengguna.admin, PeranPengguna.pengelola)
  async getRingkasan() {
    const ringkasan = await this.analyticsService.getRingkasanDashboard();
    const dataPertumbuhan = await this.analyticsService.getPertumbuhanDokumenBulan();
    const dataAktivitas = await this.analyticsService.getAktivitasHarian();
    const dokumenTerbaru = await this.analyticsService.getDokumenTerbaru();

    return {
      ...ringkasan,
      chart_pertumbuhan: dataPertumbuhan,
      chart_aktivitas: dataAktivitas,
      dokumen_terbaru: dokumenTerbaru
    };
  }
}
