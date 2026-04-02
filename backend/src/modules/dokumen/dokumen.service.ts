import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
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
import { extractMetadata } from '../../utils/metadata-extractor';
import { DeepseekService } from '../../integrations/ai/deepseek.service';

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
    private readonly deepseekService: DeepseekService,
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
    
    // 3.5. Ekstrak Metadata via Regex (Hanya jika teks tersedia)
    const meta = perluOcr ? {} : extractMetadata(isiTeks, dto.jenis);

    // 3.8. Auto-Abstrak menggunakan AI jika abstrak kosong dan teks tersedia
    let abstrakAkhir = dto.abstrak;
    if (!abstrakAkhir && !perluOcr && isiTeks.length > 500) {
      try {
        const generatedAbstrak = await this.deepseekService.generateAbstrak(isiTeks);
        if (generatedAbstrak) {
          abstrakAkhir = generatedAbstrak;
        }
      } catch (e) {
        this.logger.warn('Gagal generate auto abstrak, tetap gunakan kosong.');
      }
    }

    // 3.9. Auto-Tags menggunakan AI jika kata kunci kosong
    let kataKunciAkhir = dto.kata_kunci || [];
    if (kataKunciAkhir.length === 0 && !perluOcr && isiTeks.length > 500) {
      try {
        const generatedTags = await this.deepseekService.generateTags(isiTeks);
        if (generatedTags && generatedTags.length > 0) {
          kataKunciAkhir = generatedTags;
        }
      } catch (e) {
        this.logger.warn('Gagal generate auto tags, tetap gunakan kosong.');
      }
    }

    // 4. Simpan ke database
    const dokumen = await this.prisma.dokumen.create({
      data: {
        judul: dto.judul,
        nomor: dto.nomor,
        tahun: dto.tahun,
        jenis: dto.jenis,
        instansi: dto.instansi,
        abstrak: abstrakAkhir,
        kata_kunci: kataKunciAkhir,
        
        // Metadata hasil ekstraksi
        teu: meta.teu,
        bentuk_singkat: meta.bentuk_singkat,
        tempat_penetapan: meta.tempat_penetapan,
        tanggal_penetapan: meta.tanggal_penetapan,
        tanggal_pengundangan: meta.tanggal_pengundangan,
        tanggal_berlaku: meta.tanggal_berlaku,
        subjek: meta.subjek || dto.judul, // Fallback ke judul jika subjek regex gagal
        
        file_url: fileUrl,
        nama_file: file.originalname,
        ukuran_file: BigInt(file.size),
        isi_teks: perluOcr ? null : isiTeks,
        is_ocr: false,
        status_ocr: perluOcr ? 'menunggu' : 'selesai',
        status: dto.status || 'aktif',
        sifat_sensitif: dto.sifat_sensitif || false,
        nip_pemilik: dto.sifat_sensitif ? dto.nip_pemilik : null,
        diunggah_oleh: uploadedBy,
        dokumen_kategori: dto.kategori_ids?.length
          ? {
              create: dto.kategori_ids.map((id) => ({ kategori_id: id })),
            }
          : undefined,
      },
    });
    
    // 4.5. Buat Relasi jika Regex menemukan keterkaitan (Mencabut/Mengubah)
    if (!perluOcr && meta.relasi && meta.relasi.length > 0) {
      for (const rel of meta.relasi) {
        // Cari target dokumen berdasarkan Nomor dan Tahun
        const targetDoc = await this.prisma.dokumen.findFirst({
          where: { nomor: rel.nomorTarget, tahun: rel.tahunTarget, status: 'aktif', dihapus_pada: null }
        });
        
        if (targetDoc) {
          await this.prisma.relasiDokumen.create({
            data: {
              dokumen_id: dokumen.id,
              dokumen_terkait_id: targetDoc.id,
              tipe_relasi: rel.tipe,
              keterangan: rel.keterangan
            }
          }).catch(() => {}); // Abaikan jika duplicate
        }
      }
    }

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
    const where: any = { dihapus_pada: null, status: 'aktif', sifat_sensitif: false };
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

  async dapatkanSatu(id: string, userNip?: string, userPeran?: string) {
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

  /**
   * Akses file secara aman — Streaming file dari MinIO
   * File sensitif hanya bisa diakses oleh pemilik NIP atau Admin/Superadmin
   */
  async getBerkas(id: string, user?: { nip?: string; peran?: string }) {
    const dokumen = await this.prisma.dokumen.findFirst({
      where: { id, dihapus_pada: null },
    });
    if (!dokumen) throw new NotFoundException('Dokumen tidak ditemukan');

    if (dokumen.sifat_sensitif) {
      if (!user) {
        throw new ForbiddenException('Dokumen ini bersifat rahasia. Silakan login terlebih dahulu.');
      }

      const isAdmin = user.peran === 'superadmin' || user.peran === 'admin';
      const isOwner = user.nip && dokumen.nip_pemilik && user.nip === dokumen.nip_pemilik;

      if (!isAdmin && !isOwner) {
        throw new ForbiddenException('Anda tidak memiliki akses ke dokumen rahasia ini.');
      }
    }

    // Catat log unduh
    await this.prisma.logAktivitas.create({
      data: { dokumen_id: id, tipe_aksi: 'unduh', keterangan: `Mengakses berkas: ${dokumen.judul}` },
    });

    const stream = await this.storage.getStream(dokumen.file_url);
    return { stream, namaFile: dokumen.nama_file, mimeType: 'application/pdf' };
  }

  /**
   * Daftar dokumen untuk dashboard admin (termasuk sensitif)
   */
  async daftarSemua(filter: FilterDokumenDto) {
    const where: any = { dihapus_pada: null };
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
          sifat_sensitif: true, nip_pemilik: true,
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

  async hapusSoft(id: string, user: any): Promise<any> {
    const dokumen = await this.dapatkanSatu(id);

    // Jika admin biasa, buat permintaan persetujuan
    if (user.peran !== 'superadmin') {
      const permintaan = await this.prisma.permintaanAksi.create({
        data: {
          tipe_aksi: 'hapus',
          dokumen_id: id,
          pemohon_id: user.sub,
          status: 'menunggu',
          alasan: `Permintaan penghapusan dokumen: ${dokumen.judul}`,
        },
      });
      return {
        pesan: 'Permintaan penghapusan telah dikirim ke Super Admin.',
        status: 'menunggu_persetujuan',
        permintaan_id: permintaan.id
      };
    }

    // Jika superadmin, lakukan hapus langsung
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
        keterangan: `Dokumen dihapus langsung: ${dokumen.judul}`,
        pengguna_id: user.sub,
      },
    });

    this.logger.log(`Dokumen ${id} dihapus lengkap (file + DB + ES)`);
    return { pesan: 'Dokumen berhasil dihapus.' };
  }

  async editDokumen(id: string, dto: any, userId: string) {
    const existing = await this.dapatkanSatu(id);

    const updatedData: any = {};
    if (dto.judul !== undefined) updatedData.judul = dto.judul;
    if (dto.nomor !== undefined) updatedData.nomor = dto.nomor;
    if (dto.tahun !== undefined) updatedData.tahun = dto.tahun;
    if (dto.jenis !== undefined) updatedData.jenis = dto.jenis;
    if (dto.instansi !== undefined) updatedData.instansi = dto.instansi;
    if (dto.abstrak !== undefined) updatedData.abstrak = dto.abstrak;
    if (dto.kata_kunci !== undefined) updatedData.kata_kunci = dto.kata_kunci;
    if (dto.status !== undefined) updatedData.status = dto.status;
    if (dto.sifat_sensitif !== undefined) updatedData.sifat_sensitif = dto.sifat_sensitif;
    if (dto.nip_pemilik !== undefined) updatedData.nip_pemilik = dto.nip_pemilik;
    // Jika tidak sensitif lagi, hapus NIP pemilik
    if (dto.sifat_sensitif === false) updatedData.nip_pemilik = null;

    const dokumen = await this.prisma.dokumen.update({
      where: { id },
      data: updatedData,
    });

    // Catat audit log
    await this.prisma.logAktivitas.create({
      data: {
        dokumen_id: id,
        pengguna_id: userId,
        tipe_aksi: 'ubah',
        keterangan: `Dokumen diperbarui: ${dokumen.judul}`,
        metadata: { field_diubah: Object.keys(updatedData) },
      },
    });

    // Re-index ke Elasticsearch agar data pencarian tetap sinkron
    await this.indexingQueue.add(
      'reindex-dokumen',
      { dokumenId: id },
      { jobId: `edit-reindex-${id}-${Date.now()}` },
    );

    this.logger.log(`Dokumen ${id} diperbarui dan dijadwalkan reindex`);
    return dokumen;
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
