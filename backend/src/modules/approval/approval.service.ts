import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MinioService } from '../../integrations/storage/minio.service';
import { ElasticsearchService } from '../../integrations/elasticsearch/elasticsearch.service';
import { StatusDokumen } from '@prisma/client';

@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: MinioService,
    private readonly elasticsearch: ElasticsearchService,
  ) {}

  async daftarPermintaan(status?: string) {
    return this.prisma.permintaanAksi.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        pemohon: { select: { id: true, nama: true, email: true, peran: true, jabatan: true } },
        penyetuju: { select: { id: true, nama: true, email: true } },
      },
      orderBy: { dibuat_pada: 'desc' },
      take: 50,
    });
  }

  async setujui(id: string, penyetujuId: string) {
    const permintaan = await this.prisma.permintaanAksi.findUnique({ where: { id } });
    if (!permintaan) throw new NotFoundException('Permintaan tidak ditemukan');
    if (permintaan.status !== 'menunggu') throw new ForbiddenException('Permintaan sudah diproses');

    // Eksekusi aksi
    if (permintaan.tipe_aksi === 'hapus' && permintaan.dokumen_id) {
      await this.eksekusiHapus(permintaan.dokumen_id);
    }

    return this.prisma.permintaanAksi.update({
      where: { id },
      data: { status: 'disetujui', penyetuju_id: penyetujuId },
    });
  }

  async tolak(id: string, penyetujuId: string, alasan?: string) {
    const permintaan = await this.prisma.permintaanAksi.findUnique({ where: { id } });
    if (!permintaan) throw new NotFoundException('Permintaan tidak ditemukan');
    if (permintaan.status !== 'menunggu') throw new ForbiddenException('Permintaan sudah diproses');

    return this.prisma.permintaanAksi.update({
      where: { id },
      data: { status: 'ditolak', penyetuju_id: penyetujuId, alasan },
    });
  }

  private async eksekusiHapus(dokumenId: string) {
    const dokumen = await this.prisma.dokumen.findUnique({ where: { id: dokumenId } });
    if (!dokumen) return;

    // Hapus file di MinIO
    if (dokumen.file_url) {
      try {
        await this.storage.delete(dokumen.file_url);
      } catch (e: any) {
        this.logger.warn(`Gagal hapus file MinIO: ${e.message}`);
      }
    }

    // Soft delete di DB
    await this.prisma.dokumen.update({
      where: { id: dokumenId },
      data: { dihapus_pada: new Date(), status: StatusDokumen.dicabut },
    });

    // Hapus dari Elasticsearch
    await this.elasticsearch.deleteDokumen(dokumenId);

    this.logger.log(`Dokumen ${dokumenId} dihapus setelah approval`);
  }
}
