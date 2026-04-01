'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Book, Scale, Building } from 'lucide-react';

export default function Home() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/dokumen?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/dokumen');
    }
  };
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-bpn-dark text-white pt-20 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="container mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Jaringan Dokumentasi dan Informasi Hukum
          </h1>
          <p className="text-xl md:text-2xl text-bpn-gold mb-10 max-w-3xl mx-auto">
            Kementerian Agraria dan Tata Ruang / Badan Pertanahan Nasional Provinsi Aceh
          </p>

          <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-2 flex items-center">
            <Search className="w-6 h-6 text-gray-400 ml-4 mr-2" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari peraturan, pedoman, standar operasional..." 
              className="flex-1 bg-transparent border-none outline-none text-gray-800 text-lg py-3 px-2 w-full"
            />
            <button type="submit" className="bg-bpn text-white px-8 py-3 rounded hover:bg-bpn/90 transition shadow-md font-semibold text-lg">
              Cari Dokumen
            </button>
          </form>
        </div>
      </section>

      {/* Quick Links / Categories */}
      <section className="py-16 bg-gray-50 -mt-10 relative z-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/dokumen?jenis=produk-hukum" className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition-all flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Scale className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Produk Hukum</h3>
              <p className="text-gray-500">Undang-Undang, Peraturan Pemerintah, Perpres, Permen, dll.</p>
            </Link>

            <Link href="/dokumen?jenis=pedoman" className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition-all flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-bpn-green/10 text-bpn-green flex items-center justify-center mb-6 group-hover:bg-bpn-green group-hover:text-white transition-colors">
                <Book className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Pedoman & SOP</h3>
              <p className="text-gray-500">Pedoman teknis, Standar Operasional Prosedur, Petunjuk Pelaksanaan.</p>
            </Link>

            <Link href="/dokumen?jenis=monografi" className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition-all flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-bpn/10 text-bpn flex items-center justify-center mb-6 group-hover:bg-bpn group-hover:text-white transition-colors">
                <Building className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Monografi Kelembagaan</h3>
              <p className="text-gray-500">Profil, yurisprudensi, putusan pengadilan, dan dokumen kelembagaan.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Dokumen Terbaru */}
      <section className="py-20 bg-white px-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Dokumen Terbaru</h2>
              <p className="text-gray-600">Peraturan dan dokumen hukum yang baru saja diperbarui.</p>
            </div>
            <Link href="/dokumen" className="text-bpn font-medium hover:underline hidden sm:block">
              Lihat Semua Dokumen &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col hover:border-bpn transition group cursor-pointer bg-white">
                <div className="h-2 bg-bpn"></div>
                <div className="p-6 flex-1 flex flex-col">
                  <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded inline-block w-max mb-3">
                    Peraturan Menteri
                  </span>
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-3 group-hover:text-bpn transition">
                    Peraturan Menteri ATR/KBPN Nomor {i} Tahun 2024 Tentang Penetapan Batas Tanah
                  </h3>
                  <div className="mt-auto pt-4 flex items-center text-sm text-gray-500">
                    <span>12 Maret 2024</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Link href="/dokumen" className="text-bpn font-medium hover:underline">
              Lihat Semua Dokumen &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
