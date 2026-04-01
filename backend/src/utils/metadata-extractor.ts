/**
 * Utilitas untuk mengekstraksi metadata otomatis dari hasil teks PDF (OCR/Parser).
 * Menggunakan pendekatan Regex dan Heuristics agar sistem dapat mengisi tabel DB secara otomatis.
 */
import { TipeRelasi } from '@prisma/client';

export interface ExtractedMetadata {
  teu?: string;
  bentuk_singkat?: string;
  tempat_penetapan?: string;
  tanggal_penetapan?: Date;
  tanggal_pengundangan?: Date;
  tanggal_berlaku?: Date;
  sumber?: string;
  subjek?: string;
  bidang?: string;
  relasi?: {
    tipe: TipeRelasi;
    keterangan: string;
    nomorTarget: string;
    tahunTarget: number;
  }[];
}

/**
 * Mencoba mengekstraksi metadata penting dari isi teks dokumen peraturan.
 */
export function extractMetadata(teks: string, namaJenisDokumen: string): ExtractedMetadata {
  const meta: ExtractedMetadata = { relasi: [] };
  const teksBersih = teks.replace(/\s+/g, ' ').trim();

  // 1. T.E.U (Badan yang mengeluarkan) - Karena ini JDIH Aceh/KPK, biasanya Indonesia > Instansi
  meta.teu = 'Indonesia';
  
  // 2. Bentuk Singkat (contoh 'Peraturan Menteri' -> 'Permen')
  meta.bentuk_singkat = generateBentukSingkat(namaJenisDokumen);

  // 3. Subjek / Judul (Tentang)
  // Pola: TENTANG (Judul) DENGAN RAHMAT TUHANAtau MENIMBANG
  const tentangMatch = teksBersih.match(/TENTANG\s+(.+?)(?:DENGAN\s+RAHMAT\s+TUHAN|Menimbang\s*:|Mengingat\s*:)/i);
  if (tentangMatch && tentangMatch[1]) {
    // Ambil subjek inti (beberapa kata pertama bisa jadi subjek)
    meta.subjek = tentangMatch[1].trim().toUpperCase();
  }

  // 4. Tempat Penetapan & Tanggal Penetapan
  // Pola: Ditetapkan di Jakarta pada tanggal 15 Mei 2024
  const penetapanMatch = teksBersih.match(/Ditetapkan di\s+([A-Za-z\s]+)\s+pada\s+tanggal\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i);
  if (penetapanMatch && penetapanMatch.length >= 3) {
    meta.tempat_penetapan = penetapanMatch[1].trim();
    meta.tanggal_penetapan = parseIndonesianDate(penetapanMatch[2].trim());
  }

  // 5. Tanggal Pengundangan
  // Pola: Diundangkan di Jakarta pada tanggal 14 Agustus 2024
  const pengundanganMatch = teksBersih.match(/Diundangkan di\s+[A-Za-z\s]+\s+pada\s+tanggal\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i);
  if (pengundanganMatch && pengundanganMatch[1]) {
    meta.tanggal_pengundangan = parseIndonesianDate(pengundanganMatch[1].trim());
    // Secara default peraturan berlaku sejak diundangkan jika tidak disebutkan rinci
    meta.tanggal_berlaku = meta.tanggal_pengundangan;
  }

  // 6. Deteksi Status Relasi (Menimbang/Memutuskan mencabut)
  const mencabutMatch = teksBersih.match(/Mencabut\s+(.+?)\s+Nomor\s+(\d+)\s+Tahun\s+(\d{4})/i);
  if (mencabutMatch && mencabutMatch[2] && mencabutMatch[3]) {
    meta.relasi?.push({
      tipe: TipeRelasi.mencabut,
      keterangan: `Mencabut ${mencabutMatch[1]} Nomor ${mencabutMatch[2]} Tahun ${mencabutMatch[3]}`,
      nomorTarget: mencabutMatch[2],
      tahunTarget: parseInt(mencabutMatch[3], 10),
    });
  }

  const mengubahMatch = teksBersih.match(/Perubahan\s+(?:atas)?\s*(.+?)\s+Nomor\s+(\d+)\s+Tahun\s+(\d{4})/i);
  if (mengubahMatch && mengubahMatch[2] && mengubahMatch[3]) {
    meta.relasi?.push({
      tipe: TipeRelasi.mengubah,
      keterangan: `Mengubah ${mengubahMatch[1]} Nomor ${mengubahMatch[2]} Tahun ${mengubahMatch[3]}`,
      nomorTarget: mengubahMatch[2],
      tahunTarget: parseInt(mengubahMatch[3], 10),
    });
  }

  return meta;
}

/**
 * Parsing tanggal string bahasa Indonesia ke Date object
 * ("15 Mei 2024" -> Date)
 */
function parseIndonesianDate(dateStr: string): Date | undefined {
  const bulanMap: Record<string, string> = {
    'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
    'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
    'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
  };

  const parts = dateStr.split(' ');
  if (parts.length >= 3) {
    const d = parts[0].padStart(2, '0');
    const mStr = parts[1];
    const y = parts[2];
    
    // Cari bulan dari map case-insensitive
    const m = Object.keys(bulanMap).find(key => key.toLowerCase() === mStr.toLowerCase());
    if (m) {
      const isoString = `${y}-${bulanMap[m]}-${d}T00:00:00Z`;
      const date = new Date(isoString);
      if (!isNaN(date.getTime())) return date;
    }
  }
  return undefined;
}

/**
 * Konversi Jenis ke Singkatan secara cepat.
 */
function generateBentukSingkat(jenis: string): string {
  const map: Record<string, string> = {
    'Undang-Undang': 'UU',
    'Peraturan Pemerintah': 'PP',
    'Peraturan Presiden': 'Perpres',
    'Keputusan Presiden': 'Keppres',
    'Peraturan Menteri': 'Permen',
    'Keputusan Menteri': 'Kepmen',
    'Peraturan Daerah': 'Perda',
    'Peraturan Gubernur': 'Pergub',
    'Peraturan Bupati': 'Perbup',
    'Peraturan Walikota': 'Perwal',
  };
  return map[jenis] || jenis;
}
