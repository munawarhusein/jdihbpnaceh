-- AlterTable: Tambah kolom keamanan dokumen
ALTER TABLE "dokumen" ADD COLUMN IF NOT EXISTS "sifat_sensitif" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "dokumen" ADD COLUMN IF NOT EXISTS "nip_pemilik" VARCHAR(30);
