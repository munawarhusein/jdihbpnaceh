'use client';

import { useState, useEffect } from 'react';
import { FileText, ArrowLeft, Download, Eye, Calendar, Building, List, FileKey, Tag, Scale, Book } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

export default function DokumenDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/dokumen/${id}`)
      .then(res => setDoc(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

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

  return (
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
              <div className="flex gap-2 mb-3">
                <span className="bg-bpn text-white text-xs font-bold px-3 py-1 rounded-full">{doc.jenis || 'Dokumen'}</span>
                {doc.status === 'aktif' ? (
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">Berlaku</span>
                ) : (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">Dicabut</span>
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
                   <a target="_blank" href={doc.file_url} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-bpn hover:bg-bpn-dark text-white px-5 py-3 rounded-xl font-bold transition shadow-lg shadow-bpn/20 text-sm">
                     <Download className="w-5 h-5" /> Unduh Dokumen
                   </a>
                   <a target="_blank" href={doc.file_url} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl font-bold transition shadow-lg shadow-slate-900/20 text-sm">
                     <Eye className="w-5 h-5" /> Lihat PDF File
                   </a>
                 </>
               ) : (
                 <button disabled className="w-full flex items-center gap-2 bg-slate-200 text-slate-400 px-5 py-3 rounded-xl font-bold shadow-none text-sm cursor-not-allowed">
                     <FileKey className="w-5 h-5" /> File Tidak Tersedia
                 </button>
               )}
            </div>
          </div>
        </div>

        {/* Info & Meta Dokumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 space-y-6">
              {/* Abstrak */}
              {doc.abstrak && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><Tag className="w-5 h-5 text-bpn"/> Abstrak / Keterangan</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{doc.abstrak}</p>
                </div>
              )}
              
              {/* Hasil OCR/Isi Teks */}
              {(doc.isi_teks) ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Book className="w-5 h-5 text-bpn"/> Cuplikan Teks (Hasil Mesin OCR)</h3>
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl text-sm font-mono text-slate-700 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {doc.isi_teks}
                  </div>
                  <div className="absolute bottom-6 left-0 right-0 h-10 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none mx-6"></div>
                </div>
              ) : null}
           </div>

           {/* Sidebar Info Detail */}
           <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Informasi Meta</h3>
                <ul className="space-y-4">
                  <li>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Nama Berkas</p>
                    <p className="text-sm text-slate-800 font-medium break-words">{doc.nama_file || '-'}</p>
                  </li>
                  <li>
                     <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Ukuran File</p>
                     <p className="text-sm text-slate-800 font-medium break-words">{(Number(doc.ukuran_file||0) / 1024 / 1024).toFixed(2)} MB</p>
                  </li>
                  <li>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Penerbit JDIH</p>
                    <p className="text-sm text-slate-800 font-medium">{doc.instansi}</p>
                  </li>
                  <li>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Diunggah Pada</p>
                    <p className="text-sm text-slate-800 font-medium">
                      {new Date(doc.dibuat_pada).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })} WIB
                    </p>
                  </li>
                  <li>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Status OCR & Elasticsearch</p>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded inline-block mt-1">Terindeks</span>
                  </li>
                </ul>
              </div>

              {doc.kata_kunci && doc.kata_kunci.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Kata Kunci (Tags)</h3>
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
      </div>
    </div>
  );
}
