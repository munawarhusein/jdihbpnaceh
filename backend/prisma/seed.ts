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
  ];

  for (const nama of kategoriDefault) {
    await prisma.kategori.upsert({
      where: { nama },
      update: {},
      create: { nama },
    });
  }
  console.log(`✅ ${kategoriDefault.length} kategori berhasil dibuat`);

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
