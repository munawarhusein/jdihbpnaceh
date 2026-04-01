'use client';

import { useState, useEffect } from 'react';
import { FileText, ArrowLeft, Download, Eye, Calendar, Building, List, FileKey, Tag, Scale, Book, X, ExternalLink, Link2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

function formatTanggal(d: string | null | undefined) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function DokumenDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/dokumen/${id}`)
      .then(res => setDoc(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!doc?.file_url) return;
    
    const btn = e.currentTarget as HTMLButtonElement;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="animate-pulse">Mengunduh...</span>';
    btn.disabled = true;

    try {
      const response = await fetch(doc.file_url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = doc.nama_file || `JDIH_Dokumen_${doc.nomor || doc.tahun}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Gagal mengunduh file, fallback ke tab baru:', error);
      window.open(doc.file_url, '_blank');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-20 flex flex-col items-center">
        <div className="animate-spin w-10 h-10 border-4 border-bpn border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-500 font-medium">Memuat rincian dokumen hukum...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="bg-gray-50 min-h-screen py-20 flex flex-col items-center">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Dokumen Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-6">Dokumen yang Anda cari mungkin telah dihapus atau URL tidak valid.</p>
        <Link href="/dokumen" className="bg-bpn text-white px-6 py-2.5 rounded-lg hover:bg-bpn/90 transition shadow">
          Kembali ke Daftar Dokumen
        </Link>
      </div>
    );
  }

  // Gunakan isi_teks sebagai abstrak default jika abstrak kosong
  const abstrakTampil = doc.abstrak || (doc.isi_teks ? doc.isi_teks.substring(0, 800) + (doc.isi_teks.length > 800 ? '...' : '') : null);

  // Build metadata rows
  const metadataRows = [
    { label: 'T.E.U.', value: doc.teu || 'Indonesia' },
    { label: 'Bentuk Peraturan', value: doc.jenis || '-' },
    { label: 'Bentuk Singkat', value: doc.bentuk_singkat || '-' },
    { label: 'Nomor', value: doc.nomor || '-' },
    { label: 'Tahun', value: doc.tahun || '-' },
    { label: 'Tempat Penetapan', value: doc.tempat_penetapan || '-' },
    { label: 'Tanggal Penetapan', value: formatTanggal(doc.tanggal_penetapan) },
    { label: 'Tanggal Pengundangan', value: formatTanggal(doc.tanggal_pengundangan) },
    { label: 'Tanggal Berlaku', value: formatTanggal(doc.tanggal_berlaku) },
    { label: 'Sumber', value: doc.sumber || 'JDIH BPN Kanwil Aceh' },
    { label: 'Subjek', value: doc.subjek || '-' },
    { label: 'Bidang Hukum', value: doc.bidang || '-' },
    { label: 'Bahasa', value: doc.bahasa === 'id' ? 'Indonesia' : doc.bahasa || 'Indonesia' },
    { label: 'Penerbit', value: doc.instansi || '-' },
    { label: 'Ukuran File', value: `${(Number(doc.ukuran_file || 0) / 1024 / 1024).toFixed(2)} MB` },
    { label: 'Diunggah Pada', value: formatTanggal(doc.dibuat_pada) },
  ];

  // Status Peraturan
  const statusPeraturan = doc.status === 'aktif' ? 'Berlaku' :
    doc.status === 'dicabut' ? 'Dicabut / Tidak Berlaku' :
    doc.status === 'diubah' ? 'Telah Diubah' : doc.status;

  return (
    <>
      <div className="bg-slate-50 min-h-screen py-8 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link href="/dokumen" className="inline-flex items-center gap-2 text-bpn font-semibold hover:text-bpn-dark mb-6 transition group">
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition" /> Kembali ke Pencarian
          </Link>

          {/* Header Dokumen */}
          <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-100 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-bpn/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="flex flex-wrap md:flex-nowrap gap-6 items-start relative z-10">
              <div className="w-16 h-16 rounded-xl bg-bpn/10 flex items-center justify-center shrink-0 border border-bpn/20">
                {doc.jenis === 'Produk Hukum' ? <Scale className="w-8 h-8 text-bpn" /> :
                 doc.jenis === 'Pedoman' ? <Book className="w-8 h-8 text-bpn" /> :
                 <FileText className="w-8 h-8 text-bpn" />}
              </div>
              
              <div className="flex-1">
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="bg-bpn text-white text-xs font-bold px-3 py-1 rounded-full">{doc.jenis || 'Dokumen'}</span>
                  {doc.status === 'aktif' ? (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">✔ Berlaku</span>
                  ) : doc.status === 'dicabut' ? (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">✕ Dicabut</span>
                  ) : doc.status === 'diubah' ? (
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">⟳ Diubah</span>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">{doc.status}</span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-4 leading-tight">
                  {doc.judul}
                </h1>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    <Calendar className="w-4 h-4 text-slate-400" /> 
                    <span className="font-semibold text-slate-700">Tahun {doc.tahun}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    <Building className="w-4 h-4 text-slate-400" /> 
                    <span className="font-semibold text-slate-700">{doc.instansi}</span>
                  </div>
                  {doc.nomor && (
                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      <List className="w-4 h-4 text-slate-400" /> 
                      <span className="font-semibold text-slate-700">No. {doc.nomor}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                 {doc.file_url ? (
                   <>
                     <button onClick={handleDownload} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-bpn hover:bg-bpn-dark text-white px-5 py-3 rounded-xl font-bold transition shadow-lg shadow-bpn/20 text-sm">
                       <Download className="w-5 h-5" /> Unduh Dokumen
                     </button>
                     <button onClick={() => setShowPdfModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl font-bold transition shadow-lg shadow-slate-900/20 text-sm">
                       <Eye className="w-5 h-5" /> Lihat PDF File
                     </button>
                   </>
                 ) : (
                   <button disabled className="w-full flex items-center gap-2 bg-slate-200 text-slate-400 px-5 py-3 rounded-xl font-bold shadow-none text-sm cursor-not-allowed">
                       <FileKey className="w-5 h-5" /> File Tidak Tersedia
                   </button>
                 )}
              </div>
            </div>
          </div>

          {/* Abstrak */}
          {abstrakTampil && (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 mb-6">
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-bpn"/> Abstrak
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">{abstrakTampil}</p>
            </div>
          )}

          {/* Metadata Peraturan (Full Width Table ala KPK) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 overflow-hidden">
            <div className="bg-bpn/5 border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-bpn"/> Metadata Peraturan
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {metadataRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 hover:bg-slate-50 transition">
                  <div className="px-6 py-3 bg-slate-50/70 sm:border-r border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{row.label}</span>
                  </div>
                  <div className="sm:col-span-2 px-6 py-3">
                    <span className="text-sm text-slate-800 font-medium">{row.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Peraturan */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 overflow-hidden">
            <div className="bg-bpn/5 border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Scale className="w-5 h-5 text-bpn"/> Status Peraturan
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${
                  doc.status === 'aktif'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : doc.status === 'dicabut'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    doc.status === 'aktif' ? 'bg-emerald-500' :
                    doc.status === 'dicabut' ? 'bg-red-500' : 'bg-amber-500'
                  }`}></span>
                  {statusPeraturan}
                </span>
              </div>

              {/* Relasi Dokumen (Mencabut/Mengubah/Terkait) */}
              {doc.relasi_sebagai_sumber && doc.relasi_sebagai_sumber.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dokumen Terkait</p>
                  {doc.relasi_sebagai_sumber.map((rel: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <Link2 className="w-4 h-4 text-bpn mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded mr-2 ${
                          rel.tipe_relasi === 'mencabut'
                            ? 'bg-red-100 text-red-700'
                            : rel.tipe_relasi === 'mengubah'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {rel.tipe_relasi === 'mencabut' ? 'Mencabut' : rel.tipe_relasi === 'mengubah' ? 'Mengubah' : 'Terkait'}
                        </span>
                        <Link href={`/dokumen/${rel.dokumen_terkait?.id}`} className="text-sm font-medium text-bpn hover:underline">
                          {rel.dokumen_terkait?.judul || `No. ${rel.dokumen_terkait?.nomor} Tahun ${rel.dokumen_terkait?.tahun}`}
                        </Link>
                        {rel.keterangan && <p className="text-xs text-slate-500 mt-1">{rel.keterangan}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!doc.relasi_sebagai_sumber || doc.relasi_sebagai_sumber.length === 0) && (
                <p className="text-sm text-slate-400 italic">Tidak ada dokumen terkait yang tercatat.</p>
              )}
            </div>
          </div>

          {/* Kata Kunci */}
          {doc.kata_kunci && doc.kata_kunci.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-bpn"/> Kata Kunci (Tags)
              </h3>
              <div className="flex flex-wrap gap-2">
                {doc.kata_kunci.map((tag:string, idx:number) => (
                  <span key={idx} className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium px-2.5 py-1 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ========== MODAL PDF VIEWER ========== */}
      {showPdfModal && doc.file_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowPdfModal(false)}>
          <div className="relative w-full h-full max-w-6xl max-h-[95vh] mx-4 my-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 text-white shrink-0">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5" />
                <span className="font-bold text-sm truncate max-w-md">{doc.judul}</span>
              </div>
              <div className="flex items-center gap-2">
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition">
                  <ExternalLink className="w-3.5 h-3.5" /> Buka Tab Baru
                </a>
                <button onClick={() => setShowPdfModal(false)} className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* PDF iframe */}
            <div className="flex-1 bg-slate-200">
              <iframe 
                src={doc.file_url} 
                className="w-full h-full border-0"
                title={`Lihat PDF - ${doc.judul}`}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
