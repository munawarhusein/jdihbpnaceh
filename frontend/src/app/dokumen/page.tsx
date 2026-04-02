'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, Filter, FileText, ChevronRight, Scale, Book, Building } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';

function DokumenContent() {
  const [dokumen, setDokumen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const initQ = searchParams?.get('q') || '';
  const [query, setQuery] = useState(initQ);

  const fetchDokumen = async (q: string = '') => {
    setLoading(true);
    try {
      // Menggunakan endpoint pencarian full-text (Elasticsearch) jika ada query
      // atau endpoint standar jika kosong
      const res = await api.get(q ? `/pencarian` : `/dokumen`, {
        params: { q: q || undefined }
      });
      // Antisipasi struktur respons
      setDokumen(res.data?.data?.hasil || res.data?.data || res.data || []);
    } catch (error) {
      console.error('Gagal mengambil data dokumen:', error);
      // Dummy data sebagai fallback saat backend error
      setDokumen([
        { id: '1', judul: 'Koneksi API gagal - Memuat dummy', jenis: 'Produk Hukum', tahun: 2024, instansi: 'BPN' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDokumen(initQ);
  }, [initQ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDokumen(query);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filter */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-bpn" /> Filter Pencarian
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Jenis Dokumen</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded text-bpn focus:ring-bpn" /> Semua Dokumen
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded text-bpn focus:ring-bpn" /> Undang-Undang
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded text-bpn focus:ring-bpn" /> Peraturan Menteri
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded text-bpn focus:ring-bpn" /> Standard Operating Procedure
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Tahun / Periode</label>
                <select className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-bpn outline-none">
                  <option value="">Semua Tahun</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              <button className="w-full bg-bpn-dark hover:bg-gray-800 text-white font-medium py-2 rounded transition">
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>

        {/* Area Daftar Utama */}
        <div className="lg:col-span-3">
          {/* Header & Search */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <div className="px-4 flex items-center bg-gray-50">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari berdasarkan judul, nomor, isi, atau abstrak..." 
                className="w-full bg-transparent p-3 outline-none text-gray-700"
              />
              <button type="submit" className="bg-bpn text-white px-6 font-medium hover:bg-bpn/90 transition">
                Cari
              </button>
            </form>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {query ? `Hasil pencarian untuk "${query}"` : 'Semua Dokumen Hukum'}
          </h2>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20 text-gray-400">
                <div className="animate-spin w-8 h-8 border-4 border-bpn border-t-transparent rounded-full mx-auto mb-4"></div>
                Memuat data dokumen...
              </div>
            ) : dokumen.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100 border-dashed">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Tidak ada dokumen yang ditemukan.</p>
              </div>
            ) : (
              dokumen.map((doc, i) => (
                <Link key={doc.id || i} href={`/dokumen/${doc.id}`} passHref>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-bpn hover:shadow-md transition group cursor-pointer block">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4">
                        <div className="mt-1">
                          {doc.jenis === 'Produk Hukum' ? <Scale className="w-6 h-6 text-blue-500" /> :
                           doc.jenis === 'Pedoman' ? <Book className="w-6 h-6 text-green-500" /> :
                           <Building className="w-6 h-6 text-bpn" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded">
                              {doc.jenis || 'Dokumen'}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              Tahun {doc.tahun || '2024'}
                            </span>
                            {doc.status === 'aktif' && (
                              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">Berlaku</span>
                            )}
                            {doc.status === 'dicabut' && (
                              <span className="bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200">Tidak Berlaku</span>
                            )}
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-bpn transition leading-snug">
                            {doc.judul}
                          </h3>
                          {doc.nomor && (
                            <p className="text-sm text-gray-500 mt-1">Nomor: {doc.nomor}</p>
                          )}
                          
                          {/* Search Highlights Snippets */}
                          {doc.highlight && Object.keys(doc.highlight).length > 0 ? (
                            <div className="mt-3 text-sm text-gray-600 space-y-1 bg-yellow-50/50 p-3 rounded-lg border border-yellow-100/50">
                               {doc.highlight.isi_teks && (
                                 <p className="line-clamp-2" dangerouslySetInnerHTML={{ __html: `...${doc.highlight.isi_teks.join(' ... ')}...` }} />
                               )}
                               {doc.highlight.abstrak && !doc.highlight.isi_teks && (
                                 <p className="line-clamp-2" dangerouslySetInnerHTML={{ __html: `...${doc.highlight.abstrak.join(' ... ')}...` }} />
                               )}
                            </div>
                          ) : doc.abstrak ? (
                            <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                              {doc.abstrak}
                            </p>
                          ) : null}
                          
                          {/* Kata Kunci / Tags */}
                          {doc.kata_kunci && Array.isArray(doc.kata_kunci) && doc.kata_kunci.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {doc.kata_kunci.slice(0, 3).map((tag: string, idx: number) => (
                                <span key={idx} className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                              {doc.kata_kunci.length > 3 && (
                                <span className="text-gray-400 text-[10px] font-bold uppercase px-1 py-0.5">
                                  +{doc.kata_kunci.length - 3} lagi
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-gray-300 group-hover:text-bpn transition transform group-hover:translate-x-1 mt-2">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DokumenHukum() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">Memuat Halaman...</div>}>
      <DokumenContent />
    </Suspense>
  );
}
