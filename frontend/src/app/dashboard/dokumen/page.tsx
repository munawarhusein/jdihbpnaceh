'use client';
import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, Trash2, Search, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

export default function KelolaDokumenPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kategoris, setKategoris] = useState([]);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  
  // Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ judul: '', tahun: new Date().getFullYear(), jenis: '', instansi: 'BPN Provinsi Aceh', kategori_ids: [] });

  const fetchDokumen = async () => {
    try {
      const res = await api.get('/dokumen');
      setData(res.data.data?.hasil || []);
    } catch(e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => {
    fetchDokumen();
    api.get('/kategori').then(res => setKategoris(res.data.data || res.data)).catch(e=>console.log(e));
  }, []);

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') {
       setErr('Format file ditolak! Sistem JDIH hanya menerima dokumen berjenis .PDF asli.');
       setFile(null);
    } else if (f.size > 50 * 1024 * 1024) {
       setErr('Ukuran file PDF terlalu besar! Maksimal 50MB.');
       setFile(null);
    } else {
       setErr('');
       setFile(f);
    }
  }

  const submitUpload = async () => {
    if (!file) return setErr("Pilih atau tarik file PDF terlebih dahulu!");
    if (!form.judul || !form.jenis || !form.instansi) return setErr("Judul, Jenis, dan Instansi wajib diisi!");
    
    setUploading(true);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('judul', form.judul);
      fd.append('tahun', form.tahun.toString());
      fd.append('jenis', form.jenis);
      fd.append('instansi', form.instansi);
      
      const res = await api.post('/dokumen/unggah', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Dokumen berhasil diunggah! Mesin OCR sedang memproses teks di latar belakang.');
      setIsOpen(false);
      fetchDokumen();
    } catch(error: any) {
      setErr(error.response?.data?.message || 'Gagal tersambung ke server unggah');
    } finally {
      setUploading(false);
    }
  }

  const openForm = () => {
    setErr(''); setFile(null); setForm({ judul: '', tahun: new Date().getFullYear(), jenis: '', instansi: 'BPN Provinsi Aceh', kategori_ids: [] }); setIsOpen(true);
  }

  const hapusDokumen = async (id: string, judul: string) => {
    if(confirm(`Yakin membuang dokumen regulasi hukum: ${judul}?`)) {
      try { await api.delete(`/dokumen/${id}`); fetchDokumen(); } catch(e) { alert('Gagal menghapus') }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Peraturan & Regulasi</h2>
          <p className="text-slate-500 text-sm mt-1">Unggah dokumen regulasi PDF baru dan otomasi sistem ke sistem Elasticsearch.</p>
        </div>
        <button onClick={openForm} className="flex items-center gap-2 bg-bpn hover:bg-bpn/90 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-bpn/20 transition-all active:scale-95">
          <UploadCloud className="w-5 h-5" /> Unggah .PDF
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Cari regulasi..." className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-200 outline-none focus:border-bpn focus:ring-2 focus:ring-bpn/20" />
            </div>
         </div>
         <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-slate-500 font-semibold text-sm">Informasi Dokumen</th>
                <th className="py-4 px-6 text-slate-500 font-semibold text-sm">Klasifikasi</th>
                <th className="py-4 px-6 text-slate-500 font-semibold text-sm">Status OCR Engine</th>
                <th className="py-4 px-6 text-slate-500 font-semibold text-sm text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td colSpan={4} className="py-8 text-center text-slate-400">Loading...</td></tr> : 
                data.map((d: any) => (
                <tr key={d.id} className="hover:bg-slate-50 group">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-800 text-sm">{d.judul}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <FileText className="w-3 h-3"/> PDF • {((Number(d.ukuran_file) || 0) / 1024 / 1024).toFixed(2)} MB • {d.instansi}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                     <div className="flex flex-col gap-1 items-start">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md border border-slate-200">{d.jenis}</span>
                        <span className="text-xs font-semibold text-bpn-dark">{d.tahun}</span>
                     </div>
                  </td>
                  <td className="py-4 px-6">
                    {d.status_ocr === 'selesai' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-md border border-emerald-100">
                        <CheckCircle className="w-3.5 h-3.5"/> Pengindeksan Berhasil
                      </span>
                    ) : d.status_ocr === 'menunggu' || d.status_ocr === 'diproses' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1.5 rounded-md border border-amber-100">
                        <Clock className="w-3.5 h-3.5 animate-spin-slow"/> Mesin Sedang Membaca
                      </span>
                    ) : (
                       <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2 py-1.5 rounded-md border border-red-100">
                        <AlertCircle className="w-3.5 h-3.5"/> Kesalahan Ekstraksi
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={()=>hapusDokumen(d.id, d.judul)} className="p-2 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg transition"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && !loading && <tr><td colSpan={4} className="py-10 text-center text-slate-400">Berkas hukum masih kosong.</td></tr>}
            </tbody>
          </table>
         </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between shrink-0">
              <h3 className="font-bold text-lg">Pendaftaran Dokumen Resmi</h3>
              <button disabled={uploading} onClick={()=>setIsOpen(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-800"/></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
              {err && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl font-medium border border-red-100 flex items-start gap-2 animate-in fade-in slide-in-from-top-2"><AlertCircle className="w-5 h-5 shrink-0 mt-0.5"/> <span>{err}</span></div>}

              {/* Zona Drag & Drop PDF */}
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDragging ? 'border-bpn bg-bpn/5 scale-[1.02]' : 'border-slate-300 hover:bg-slate-50'}`}
                onDragOver={(e)=>{e.preventDefault(); setIsDragging(true)}}
                onDragLeave={()=>setIsDragging(false)}
                onDrop={(e)=>{
                  e.preventDefault(); setIsDragging(false);
                  if(e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
                }}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,application/pdf" onChange={(e)=> e.target.files && handleFile(e.target.files[0])} />
                
                {!file ? (
                  <div className="flex flex-col items-center gap-3">
                     <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><FileText className="w-8 h-8"/></div>
                     <p className="font-semibold text-slate-700">Tarik dokumen PDF ke sini</p>
                     <p className="text-sm text-slate-500">Ekstensi murni .PDF (Batas maks 50MB)</p>
                     <button onClick={()=>fileInputRef.current?.click()} className="mt-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold shadow-md hover:scale-105 transition-transform">Cari via Direktori</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                     <div className="w-16 h-16 rounded-full bg-bpn/10 flex items-center justify-center text-bpn"><CheckCircle className="w-8 h-8"/></div>
                     <p className="font-bold text-slate-800">{file.name}</p>
                     <p className="text-sm text-bpn font-medium">~{(file.size/1024/1024).toFixed(2)} MB Diterima</p>
                     <button onClick={()=>setFile(null)} className="mt-2 text-sm font-bold text-red-500 hover:text-red-700 underline underline-offset-4">Ganti File</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="sm:col-span-2">
                   <label className="text-sm font-semibold mb-1.5 block">Judul Regulasi</label>
                   <input type="text" value={form.judul} onChange={e=>setForm({...form, judul: e.target.value})} placeholder="Contoh: Surat Edaran Penertiban..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-bpn/20 outline-none" />
                 </div>
                 <div>
                   <label className="text-sm font-semibold mb-1.5 block">Tahun Terbit</label>
                   <input type="number" min="1945" max="2050" value={form.tahun} onChange={e=>setForm({...form, tahun: Number(e.target.value)})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-bpn/20 outline-none" />
                 </div>
                 <div>
                   <label className="text-sm font-semibold mb-1.5 block">Klasifikasi Dokumen</label>
                   <select value={form.jenis} onChange={e=>setForm({...form, jenis: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-bpn/20 outline-none cursor-pointer">
                      <option value="">Pilih klasifikasi...</option>
                      {kategoris.map((k:any) => <option key={k.id} value={k.nama}>{k.nama}</option>)}
                      <option value="Undang-undang">Undang-Undang</option>
                      <option value="SOP">SOP BPN</option>
                      <option value="Lainnya">Lainnya...</option>
                   </select>
                 </div>
                 <div className="sm:col-span-2">
                   <label className="text-sm font-semibold mb-1.5 block">Instansi Penerbit</label>
                   <input type="text" value={form.instansi} onChange={e=>setForm({...form, instansi: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-bpn/20 outline-none" />
                 </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0 rounded-b-2xl">
              <button disabled={uploading} onClick={()=>setIsOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition">Batal</button>
              <button disabled={uploading} onClick={submitUpload} className="px-5 py-2.5 bg-bpn hover:bg-bpn-dark disabled:bg-bpn/50 text-white rounded-xl text-sm font-bold shadow-md shadow-bpn/20 flex items-center gap-2 transition active:scale-95">
                {uploading ? <><Clock className="w-4 h-4 animate-spin"/> Menyimpan Objek...</> : <><UploadCloud className="w-4 h-4"/> Serahkan & OCR</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
