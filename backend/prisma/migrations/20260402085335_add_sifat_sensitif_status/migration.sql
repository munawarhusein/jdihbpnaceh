-- CreateEnum
CREATE TYPE "StatusPermintaan" AS ENUM ('menunggu', 'disetujui', 'ditolak');

-- AlterEnum
ALTER TYPE "PeranPengguna" ADD VALUE 'superadmin';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipeAksi" ADD VALUE 'setujui';
ALTER TYPE "TipeAksi" ADD VALUE 'tolak';

-- AlterTable
ALTER TABLE "dokumen" ADD COLUMN     "bentuk_singkat" VARCHAR(100),
ADD COLUMN     "bidang" VARCHAR(255),
ADD COLUMN     "nip_pemilik" VARCHAR(30),
ADD COLUMN     "sifat_sensitif" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subjek" VARCHAR(255),
ADD COLUMN     "sumber" VARCHAR(255),
ADD COLUMN     "tanggal_berlaku" TIMESTAMP(3),
ADD COLUMN     "tanggal_penetapan" TIMESTAMP(3),
ADD COLUMN     "tanggal_pengundangan" TIMESTAMP(3),
ADD COLUMN     "tempat_penetapan" VARCHAR(255),
ADD COLUMN     "teu" VARCHAR(255);

-- AlterTable
ALTER TABLE "pengguna" ADD COLUMN     "foto_url" VARCHAR(1000),
ADD COLUMN     "jabatan" VARCHAR(255),
ADD COLUMN     "nip" VARCHAR(30),
ADD COLUMN     "no_telepon" VARCHAR(20),
ADD COLUMN     "unit_kerja" VARCHAR(255);

-- CreateTable
CREATE TABLE "permintaan_aksi" (
    "id" TEXT NOT NULL,
    "tipe_aksi" "TipeAksi" NOT NULL,
    "dokumen_id" TEXT,
    "pemohon_id" TEXT NOT NULL,
    "penyetuju_id" TEXT,
    "status" "StatusPermintaan" NOT NULL DEFAULT 'menunggu',
    "alasan" TEXT,
    "metadata" JSONB,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permintaan_aksi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "permintaan_aksi_status_idx" ON "permintaan_aksi"("status");

-- CreateIndex
CREATE INDEX "permintaan_aksi_pemohon_id_idx" ON "permintaan_aksi"("pemohon_id");

-- CreateIndex
CREATE INDEX "permintaan_aksi_dokumen_id_idx" ON "permintaan_aksi"("dokumen_id");

-- AddForeignKey
ALTER TABLE "permintaan_aksi" ADD CONSTRAINT "permintaan_aksi_pemohon_id_fkey" FOREIGN KEY ("pemohon_id") REFERENCES "pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permintaan_aksi" ADD CONSTRAINT "permintaan_aksi_penyetuju_id_fkey" FOREIGN KEY ("penyetuju_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;
