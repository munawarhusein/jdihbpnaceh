import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as pdfParse from 'pdf-parse';
import { PrismaService } from '../../database/prisma.service';
import { MinioService } from '../../integrations/storage/minio.service';
import { ElasticsearchService } from '../../integrations/elasticsearch/elasticsearch.service';
import { BuatDokumenDto } from './dto/buat-dokumen.dto';
import { FilterDokumenDto } from './dto/filter-dokumen.dto';
import { OCR_QUEUE, INDEXING_QUEUE } from '../../queue/ocr.processor';
import { ConfigService } from '@nestjs/config';
import { StatusDokumen } from '@prisma/client';

@Injectable()
export class DokumenService {
  private readonly logger = new Logger(DokumenService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: MinioService,
    private readonly elasticsearch: ElasticsearchService,
    private readonly configService: ConfigService,
    @InjectQueue(OCR_QUEUE) private readonly ocrQueue: Queue,
    @InjectQueue(INDEXING_QUEUE) private readonly indexingQueue: Queue,
  ) {}

  /**
   * Upload PDF — Pipeline utama
   * 1. Upload ke MinIO
   * 2. Extract text dari PDF
   * 3. Jika teks pendek → OCR queue
   * 4. Simpan ke database
   * 5. Index ke Elasticsearch (async)
   */
  async uploadDanBuat(
    file: Express.Multer.File,
    dto: BuatDokumenDto,
    uploadedBy: string,
  ) {
    // Validasi file
    if (!file) throw new BadRequestException('File PDF wajib diunggah');
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Hanya file PDF yang diperbolehkan');
    }

    const maxSize = this.configService.get('upload.maxFileSizeMb', 50) * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(`Ukuran file maksimal ${maxSize / 1024 / 1024}MB`);
    }

    // 1. Upload ke MinIO
    this.logger.log(`Mengunggah file: ${file.originalname}`);
    const fileUrl = await this.storage.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      `dokumen/${dto.tahun}`,
    );

    // 2. Extract teks dari PDF
    let isiTeks = '';
    let isOcr = false;
    const threshold = this.configService.get('ocr.textThreshold', 100);

    try {
      const pdfData = await pdfParse(file.buffer);
      isiTeks = pdfData.text?.trim() || '';
    } catch (error) {
      this.logger.warn(`Gagal parse PDF ${file.originalname}, akan di-OCR`);
    }

    // 3. Tentukan apakah perlu OCR
    const perluOcr = isiTeks.length < threshold;

    // 4. Simpan ke database
    const dokumen = await this.prisma.dokumen.create({
      data: {
        judul: dto.judul,
        nomor: dto.nomor,
        tahun: dto.tahun,
        jenis: dto.jenis,
        instansi: dto.instansi,
        abstrak: dto.abstrak,
        kata_kunci: dto.kata_kunci || [],
        file_url: fileUrl,
        nama_file: file.originalname,
        ukuran_file: BigInt(file.size),
        isi_teks: perluOcr ? null : isiTeks,
        is_ocr: false,
        status_ocr: perluOcr ? 'menunggu' : 'selesai',
        diunggah_oleh: uploadedBy,
        dokumen_kategori: dto.kategori_ids?.length
          ? {
              create: dto.kategori_ids.map((id) => ({ kategori_id: id })),
            }
          : undefined,
      },
    });

    // 5. Kirim ke OCR queue jika perlu
    if (perluOcr) {
      await this.ocrQueue.add(
        'proses-ocr',
        { dokumenId: dokumen.id, fileUrl },
        {
          jobId: `ocr-${dokumen.id}`, // Idempotent: satu dokumen satu job
          priority: 2,
        },
      );
      this.logger.log(`Dokumen ${dokumen.id} dikirim ke OCR queue`);
    } else {
      // Langsung index ke Elasticsearch
      await this.indexingQueue.add(
        'index-dokumen',
        { dokumenId: dokumen.id },
        { jobId: `index-${dokumen.id}` },
      );
    }

    // Catat audit log
    await this.prisma.logAktivitas.create({
      data: {
        dokumen_id: dokumen.id,
        tipe_aksi: 'unggah',
        keterangan: `Dokumen diunggah: ${dto.judul}`,
        metadata: { nama_file: file.originalname, ukuran: file.size },
      },
    });

    return dokumen;
  }

  async cariDenganFilter(filter: FilterDokumenDto) {
    // Gunakan Elasticsearch jika ada query text
    if (filter.q) {
      return this.elasticsearch.search({
        query: filter.q,
        jenis: filter.jenis,
        instansi: filter.instansi,
        tahunDari: filter.tahun,
        tahunSampai: filter.tahun,
        halaman: filter.halaman,
        limitPerHalaman: filter.limit,
        urutkan: filter.urutkan,
      });
    }

    // Tanpa query: gunakan database langsung
    const where: any = { dihapus_pada: null, status: 'aktif' };
    if (filter.jenis) where.jenis = filter.jenis;
    if (filter.instansi) where.instansi = { contains: filter.instansi, mode: 'insensitive' };
    if (filter.tahun) where.tahun = filter.tahun;

    const [total, items] = await Promise.all([
      this.prisma.dokumen.count({ where }),
      this.prisma.dokumen.findMany({
        where,
        select: {
          id: true, judul: true, nomor: true, tahun: true,
          jenis: true, instansi: true, status: true, dibuat_pada: true,
          status_ocr: true, ukuran_file: true, file_url: true, nama_file: true,
        },
        orderBy: { dibuat_pada: filter.urutkan === 'terlama' ? 'asc' : 'desc' },
        skip: ((filter.halaman || 1) - 1) * (filter.limit || 10),
        take: filter.limit || 10,
      }),
    ]);

    return {
      total,
      halaman: filter.halaman || 1,
      limit_per_halaman: filter.limit || 10,
      total_halaman: Math.ceil(total / (filter.limit || 10)),
      hasil: items,
    };
  }

  async dapatkanSatu(id: string) {
    const dokumen = await this.prisma.dokumen.findFirst({
      where: { id, dihapus_pada: null },
      include: {
        dokumen_kategori: { include: { kategori: true } },
        relasi_sebagai_sumber: {
          include: { dokumen_terkait: { select: { id: true, judul: true, nomor: true, tahun: true } } },
        },
      },
    });
    if (!dokumen) throw new NotFoundException('Dokumen tidak ditemukan');

    // Catat log view
    await this.prisma.logAktivitas.create({
      data: { dokumen_id: id, tipe_aksi: 'lihat' },
    });

    return dokumen;
  }

  async hapusSoft(id: string): Promise<void> {
    const dokumen = await this.dapatkanSatu(id);

    // 1. Hapus file fisik dari MinIO
    if (dokumen.file_url) {
      try {
        await this.storage.delete(dokumen.file_url);
        this.logger.log(`File MinIO dihapus: ${dokumen.file_url}`);
      } catch (e: any) {
        this.logger.warn(`Gagal hapus file MinIO untuk dokumen ${id}: ${e.message}`);
      }
    }

    // 2. Soft delete di database
    await this.prisma.dokumen.update({
      where: { id },
      data: { dihapus_pada: new Date(), status: StatusDokumen.dicabut },
    });

    // 3. Hapus index Elasticsearch
    await this.elasticsearch.deleteDokumen(id);

    // 4. Catat audit log
    await this.prisma.logAktivitas.create({
      data: {
        dokumen_id: id,
        tipe_aksi: 'hapus',
        keterangan: `Dokumen dihapus: ${dokumen.judul}`,
      },
    });

    this.logger.log(`Dokumen ${id} dihapus lengkap (file + DB + ES)`);
  }

  async reindex(id: string): Promise<void> {
    const dokumen = await this.dapatkanSatu(id);
    await this.indexingQueue.add(
      'reindex-dokumen',
      { dokumenId: id },
      { jobId: `reindex-${id}-${Date.now()}` },
    );
    this.logger.log(`Dokumen ${id} dijadwalkan untuk re-index`);
  }
}
