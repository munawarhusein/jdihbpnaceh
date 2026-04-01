import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ElasticsearchService } from '../integrations/elasticsearch/elasticsearch.service';
import { MinioService } from '../integrations/storage/minio.service';
import * as Tesseract from 'node-tesseract-ocr';
import * as pdfLib from 'pdf-parse';
import { fromBuffer } from 'pdf2pic';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

export const OCR_QUEUE = 'ocr_queue';
export const INDEXING_QUEUE = 'indexing_queue';

export interface OcrJobData {
  dokumenId: string;
  fileUrl: string;
  percobaan?: number;
}

export interface IndexingJobData {
  dokumenId: string;
}

@Processor(OCR_QUEUE)
export class OcrProcessor extends WorkerHost {
  private readonly logger = new Logger(OcrProcessor.name);
  private readonly MAX_RETRIES = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearch: ElasticsearchService,
    private readonly storage: MinioService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job<OcrJobData>): Promise<void> {
    const { dokumenId, fileUrl } = job.data;

    this.logger.log(`OCR dimulai untuk dokumen: ${dokumenId} (percobaan: ${job.attemptsMade + 1})`);

    // Update status menjadi "diproses"
    await this.prisma.dokumen.update({
      where: { id: dokumenId },
      data: { status_ocr: 'diproses', percobaan_ocr: job.attemptsMade + 1 },
    });

    let tmpDir: string | null = null;

    try {
      // Buat temp directory
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jdih-ocr-'));

      // 1. Download file PDF dari MinIO
      const pdfStream = await this.storage.getStream(fileUrl);
      const pdfBuffer = await this.streamToBuffer(pdfStream);

      // 2. Convert PDF ke gambar per halaman
      const pdfInfo = await pdfLib(pdfBuffer);
      const totalHalaman = pdfInfo.numpages;
      this.logger.log(`Dokumen ${dokumenId}: ${totalHalaman} halaman`);

      const hasilTeks: string[] = [];
      const language = this.configService.get('ocr.language') || 'ind+eng';

      // Proses per halaman untuk menghindari memory overflow
      for (let halaman = 1; halaman <= Math.min(totalHalaman, 100); halaman++) {
        try {
          const gambar = await fromBuffer(pdfBuffer, {
            density: 200,
            saveFilename: `halaman_${halaman}`,
            savePath: tmpDir,
            format: 'png',
            width: 2480,
            height: 3508,
          })(halaman);

          if (gambar.path) {
            const teks = await Tesseract.recognize(gambar.path, {
              lang: language,
              oem: 3,
              psm: 6,
            });
            hasilTeks.push(teks.trim());
          }
        } catch (halamanError) {
          this.logger.warn(`Gagal OCR halaman ${halaman} dokumen ${dokumenId}:`, halamanError);
        }

        // Update progress
        await job.updateProgress(Math.floor((halaman / totalHalaman) * 100));
      }

      const isiTeksGabungan = hasilTeks.filter(Boolean).join('\n\n').trim();

      // 3. Update database
      const dokumenUpdated = await this.prisma.dokumen.update({
        where: { id: dokumenId },
        data: {
          isi_teks: isiTeksGabungan,
          status_ocr: 'selesai',
          is_ocr: true,
        },
      });

      // 4. Re-index ke Elasticsearch
      await this.elasticsearch.indexDokumenDoc({
        id: dokumenUpdated.id,
        judul: dokumenUpdated.judul,
        nomor: dokumenUpdated.nomor || undefined,
        tahun: dokumenUpdated.tahun,
        jenis: dokumenUpdated.jenis,
        instansi: dokumenUpdated.instansi,
        status: dokumenUpdated.status,
        isi_teks: isiTeksGabungan,
        kata_kunci: dokumenUpdated.kata_kunci,
        abstrak: dokumenUpdated.abstrak || undefined,
        is_ocr: true,
        dibuat_pada: dokumenUpdated.dibuat_pada,
        diperbarui_pada: dokumenUpdated.diperbarui_pada,
      });

      this.logger.log(`OCR selesai untuk dokumen: ${dokumenId} (${isiTeksGabungan.length} karakter)`);
    } catch (error) {
      this.logger.error(`OCR gagal untuk dokumen ${dokumenId}:`, error);

      // Update status gagal jika retry habis
      if (job.attemptsMade >= this.MAX_RETRIES - 1) {
        await this.prisma.dokumen.update({
          where: { id: dokumenId },
          data: { status_ocr: 'gagal' },
        });
      }

      throw error; // BullMQ akan handle retry
    } finally {
      // Bersihkan temp files
      if (tmpDir && fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    }
  }

  private streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
