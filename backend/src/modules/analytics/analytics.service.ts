import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getRingkasanDashboard() {
    const total_dokumen = await this.prisma.dokumen.count({
      where: { dihapus_pada: null }
    });

    const total_kunjungan = await this.prisma.logAktivitas.count({
      where: { tipe_aksi: 'lihat' }
    });

    const total_ocr = await this.prisma.dokumen.count({
      where: { is_ocr: true, dihapus_pada: null }
    });

    const dokumen_baru_bulan_ini = await this.prisma.dokumen.count({
      where: {
        dibuat_pada: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        },
        dihapus_pada: null
      }
    });

    return {
      total_dokumen,
      total_kunjungan,
      total_ocr,
      dokumen_baru: dokumen_baru_bulan_ini
    };
  }

  async getPertumbuhanDokumenBulan() {
    // Angka pertumbuhan bulan-bulan lalu untuk chart
    // Implementasi cepat
    const currentYear = new Date().getFullYear();
    const data = [];
    for (let m = 0; m < 12; m++) {
      const gte = new Date(currentYear, m, 1);
      const lte = new Date(currentYear, m + 1, 0);
      const count = await this.prisma.dokumen.count({
        where: { dibuat_pada: { gte, lte }, dihapus_pada: null }
      });
      const bulanArray = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      data.push({ name: bulanArray[m], dokumen: count });
    }
    // Filter out future months that have 0 entries for clean chart
    const currentMonth = new Date().getMonth();
    return data.slice(0, currentMonth + 1);
  }

  async getAktivitasHarian() {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      targetDate.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(targetDate);
      nextDate.setDate(targetDate.getDate() + 1);

      const lihat = await this.prisma.logAktivitas.count({
        where: { tipe_aksi: 'lihat', dibuat_pada: { gte: targetDate, lt: nextDate } }
      });
      const unduh = await this.prisma.logAktivitas.count({
        where: { tipe_aksi: 'unduh', dibuat_pada: { gte: targetDate, lt: nextDate } }
      });

      // Format nama hari misal "Senin"
      const dateFormatter = new Intl.DateTimeFormat('id-ID', { weekday: 'long' });
      const dayName = dateFormatter.format(targetDate);
      data.push({ name: dayName, lihat, unduh });
    }
    return data;
  }

  async getDokumenTerbaru() {
    return this.prisma.dokumen.findMany({
      where: { dihapus_pada: null },
      orderBy: { dibuat_pada: 'desc' },
      take: 5,
      select: {
        id: true,
        judul: true,
        jenis: true,
        dibuat_pada: true,
        status_ocr: true,
        ukuran_file: true
      }
    });
  }

  async getStatistikPublik() {
    const total_dokumen = await this.prisma.dokumen.count({
      where: { dihapus_pada: null, status: 'aktif' }
    });

    const jenisStats = await this.prisma.dokumen.groupBy({
      by: ['jenis'],
      where: { dihapus_pada: null, status: 'aktif' },
      _count: { _all: true }
    });

    const tahunStats = await this.prisma.dokumen.groupBy({
      by: ['tahun'],
      where: { dihapus_pada: null, status: 'aktif' },
      _count: { _all: true },
      orderBy: { tahun: 'asc' }
    });

    return {
      total_dokumen,
      berdasarkan_jenis: jenisStats.map(s => ({ name: s.jenis, count: s._count._all })),
      berdasarkan_tahun: tahunStats.map(s => ({ name: s.tahun, count: s._count._all }))
    };
  }
}
