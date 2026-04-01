-- CreateEnum
CREATE TYPE "PeranPengguna" AS ENUM ('admin', 'pengelola', 'publik');

-- CreateEnum
CREATE TYPE "StatusDokumen" AS ENUM ('draf', 'aktif', 'dicabut', 'diubah');

-- CreateEnum
CREATE TYPE "StatusOcr" AS ENUM ('menunggu', 'diproses', 'selesai', 'gagal');

-- CreateEnum
CREATE TYPE "TipeRelasi" AS ENUM ('mengubah', 'mencabut', 'terkait');

-- CreateEnum
CREATE TYPE "TipeAksi" AS ENUM ('unggah', 'ubah', 'hapus', 'lihat', 'unduh', 'login', 'logout');

-- CreateTable
CREATE TABLE "pengguna" (
    "id" TEXT NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "kata_sandi" VARCHAR(255) NOT NULL,
    "peran" "PeranPengguna" NOT NULL DEFAULT 'publik',
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "terakhir_masuk" TIMESTAMP(3),
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL,
    "dihapus_pada" TIMESTAMP(3),

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori" (
    "id" TEXT NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "keterangan" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumen" (
    "id" TEXT NOT NULL,
    "judul" VARCHAR(500) NOT NULL,
    "nomor" VARCHAR(100),
    "tahun" INTEGER NOT NULL,
    "jenis" VARCHAR(100) NOT NULL,
    "instansi" VARCHAR(255) NOT NULL,
    "status" "StatusDokumen" NOT NULL DEFAULT 'aktif',
    "file_url" VARCHAR(1000) NOT NULL,
    "nama_file" VARCHAR(500) NOT NULL,
    "ukuran_file" BIGINT NOT NULL DEFAULT 0,
    "isi_teks" TEXT,
    "is_ocr" BOOLEAN NOT NULL DEFAULT false,
    "status_ocr" "StatusOcr" NOT NULL DEFAULT 'menunggu',
    "percobaan_ocr" INTEGER NOT NULL DEFAULT 0,
    "singkatan" VARCHAR(100),
    "abstrak" TEXT,
    "kata_kunci" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bahasa" VARCHAR(10) NOT NULL DEFAULT 'id',
    "halaman" INTEGER,
    "terindeks_di_es" BOOLEAN NOT NULL DEFAULT false,
    "diunggah_oleh" VARCHAR(255),
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL,
    "dihapus_pada" TIMESTAMP(3),

    CONSTRAINT "dokumen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumen_kategori" (
    "id" TEXT NOT NULL,
    "dokumen_id" TEXT NOT NULL,
    "kategori_id" TEXT NOT NULL,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dokumen_kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relasi_dokumen" (
    "id" TEXT NOT NULL,
    "dokumen_id" TEXT NOT NULL,
    "dokumen_terkait_id" TEXT NOT NULL,
    "tipe_relasi" "TipeRelasi" NOT NULL,
    "keterangan" TEXT,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relasi_dokumen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_aktivitas" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT,
    "dokumen_id" TEXT,
    "tipe_aksi" "TipeAksi" NOT NULL,
    "keterangan" TEXT,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "metadata" JSONB,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_aktivitas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_email_key" ON "pengguna"("email");

-- CreateIndex
CREATE INDEX "pengguna_email_idx" ON "pengguna"("email");

-- CreateIndex
CREATE INDEX "pengguna_peran_idx" ON "pengguna"("peran");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_nama_key" ON "kategori"("nama");

-- CreateIndex
CREATE INDEX "dokumen_tahun_idx" ON "dokumen"("tahun");

-- CreateIndex
CREATE INDEX "dokumen_jenis_idx" ON "dokumen"("jenis");

-- CreateIndex
CREATE INDEX "dokumen_instansi_idx" ON "dokumen"("instansi");

-- CreateIndex
CREATE INDEX "dokumen_status_idx" ON "dokumen"("status");

-- CreateIndex
CREATE INDEX "dokumen_status_ocr_idx" ON "dokumen"("status_ocr");

-- CreateIndex
CREATE INDEX "dokumen_dibuat_pada_idx" ON "dokumen"("dibuat_pada");

-- CreateIndex
CREATE INDEX "dokumen_dihapus_pada_idx" ON "dokumen"("dihapus_pada");

-- CreateIndex
CREATE INDEX "dokumen_kategori_dokumen_id_idx" ON "dokumen_kategori"("dokumen_id");

-- CreateIndex
CREATE INDEX "dokumen_kategori_kategori_id_idx" ON "dokumen_kategori"("kategori_id");

-- CreateIndex
CREATE UNIQUE INDEX "dokumen_kategori_dokumen_id_kategori_id_key" ON "dokumen_kategori"("dokumen_id", "kategori_id");

-- CreateIndex
CREATE INDEX "relasi_dokumen_dokumen_id_idx" ON "relasi_dokumen"("dokumen_id");

-- CreateIndex
CREATE INDEX "relasi_dokumen_dokumen_terkait_id_idx" ON "relasi_dokumen"("dokumen_terkait_id");

-- CreateIndex
CREATE UNIQUE INDEX "relasi_dokumen_dokumen_id_dokumen_terkait_id_tipe_relasi_key" ON "relasi_dokumen"("dokumen_id", "dokumen_terkait_id", "tipe_relasi");

-- CreateIndex
CREATE INDEX "log_aktivitas_pengguna_id_idx" ON "log_aktivitas"("pengguna_id");

-- CreateIndex
CREATE INDEX "log_aktivitas_dokumen_id_idx" ON "log_aktivitas"("dokumen_id");

-- CreateIndex
CREATE INDEX "log_aktivitas_tipe_aksi_idx" ON "log_aktivitas"("tipe_aksi");

-- CreateIndex
CREATE INDEX "log_aktivitas_dibuat_pada_idx" ON "log_aktivitas"("dibuat_pada");

-- AddForeignKey
ALTER TABLE "dokumen_kategori" ADD CONSTRAINT "dokumen_kategori_dokumen_id_fkey" FOREIGN KEY ("dokumen_id") REFERENCES "dokumen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen_kategori" ADD CONSTRAINT "dokumen_kategori_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "kategori"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relasi_dokumen" ADD CONSTRAINT "relasi_dokumen_dokumen_id_fkey" FOREIGN KEY ("dokumen_id") REFERENCES "dokumen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relasi_dokumen" ADD CONSTRAINT "relasi_dokumen_dokumen_terkait_id_fkey" FOREIGN KEY ("dokumen_terkait_id") REFERENCES "dokumen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_aktivitas" ADD CONSTRAINT "log_aktivitas_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_aktivitas" ADD CONSTRAINT "log_aktivitas_dokumen_id_fkey" FOREIGN KEY ("dokumen_id") REFERENCES "dokumen"("id") ON DELETE SET NULL ON UPDATE CASCADE;
