import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai seed database...');

  // Buat kategori default
  const kategoriDefault = [
    'Undang-Undang',
    'Peraturan Pemerintah',
    'Peraturan Presiden',
    'Peraturan Menteri',
    'Peraturan Daerah',
    'Keputusan Menteri',
    'Keputusan Presiden',
    'Instruksi Presiden',
    'Surat Edaran',
    'Nota Kesepahaman',
    'Standard Operating Procedure',
    // Label Bidang
    'Hak Guna Usaha (HGU)',
    'Pendaftaran Tanah',
    'PPID',
    'Perencanaan',
    'Anggaran',
    'Tata Ruang',
    'Pertanahan',
    'Pengadaan Tanah',
    'Kepegawaian',
  ];

  for (const nama of kategoriDefault) {
    await prisma.kategori.upsert({
      where: { nama },
      update: {},
      create: { nama },
    });
  }
  console.log(`✅ ${kategoriDefault.length} kategori berhasil dibuat`);

  // Buat superadmin
  const superadminEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@bpnaceh.go.id';
  const superadminPassword = process.env.SUPERADMIN_PASSWORD || 'Super@BPN2024!';

  await prisma.pengguna.upsert({
    where: { email: superadminEmail },
    update: { peran: 'superadmin' },
    create: {
      nama: 'Super Administrator JDIH',
      email: superadminEmail,
      kata_sandi: await bcrypt.hash(superadminPassword, 12),
      peran: 'superadmin',
      jabatan: 'Kepala Kantor Wilayah',
      unit_kerja: 'Kanwil BPN Provinsi Aceh',
      aktif: true,
    },
  });
  console.log(`✅ Superadmin dibuat: ${superadminEmail}`);

  // Buat admin default
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bpnaceh.go.id';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@BPN2024!';

  await prisma.pengguna.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nama: 'Administrator JDIH',
      email: adminEmail,
      kata_sandi: await bcrypt.hash(adminPassword, 12),
      peran: 'admin',
      jabatan: 'Pengelola JDIH',
      unit_kerja: 'Seksi Hukum dan HAM',
      aktif: true,
    },
  });
  console.log(`✅ Admin dibuat: ${adminEmail}`);

  // Buat pengelola default
  const pengelolaEmail = 'pengelola@bpnaceh.go.id';
  await prisma.pengguna.upsert({
    where: { email: pengelolaEmail },
    update: {},
    create: {
      nama: 'Pengelola JDIH',
      email: pengelolaEmail,
      kata_sandi: await bcrypt.hash('Pengelola@BPN2024!', 12),
      peran: 'pengelola',
      aktif: true,
    },
  });
  console.log(`✅ Pengelola dibuat: ${pengelolaEmail}`);

  console.log('🎉 Seed selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
