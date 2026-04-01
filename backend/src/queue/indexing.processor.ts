import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ElasticsearchService } from '../integrations/elasticsearch/elasticsearch.service';
import { INDEXING_QUEUE, IndexingJobData } from './ocr.processor';

@Processor(INDEXING_QUEUE)
export class IndexingProcessor extends WorkerHost {
  private readonly logger = new Logger(IndexingProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearch: ElasticsearchService,
  ) {
    super();
  }

  async process(job: Job<IndexingJobData>): Promise<void> {
    const { dokumenId } = job.data;

    const dokumen = await this.prisma.dokumen.findUnique({
      where: { id: dokumenId, dihapus_pada: null },
    });

    if (!dokumen) {
      this.logger.warn(`Dokumen ${dokumenId} tidak ditemukan, skip indexing`);
      return;
    }

    await this.elasticsearch.indexDokumenDoc({
      id: dokumen.id,
      judul: dokumen.judul,
      nomor: dokumen.nomor || undefined,
      tahun: dokumen.tahun,
      jenis: dokumen.jenis,
      instansi: dokumen.instansi,
      status: dokumen.status,
      isi_teks: dokumen.isi_teks || undefined,
      kata_kunci: dokumen.kata_kunci,
      abstrak: dokumen.abstrak || undefined,
      is_ocr: dokumen.is_ocr,
      dibuat_pada: dokumen.dibuat_pada,
      diperbarui_pada: dokumen.diperbarui_pada,
    });

    // Tandai sudah terindeks
    await this.prisma.dokumen.update({
      where: { id: dokumenId },
      data: { terindeks_di_es: true },
    });

    this.logger.log(`Dokumen ${dokumenId} berhasil diindeks ke Elasticsearch`);
  }
}
