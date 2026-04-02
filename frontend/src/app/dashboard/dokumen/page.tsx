'use client';
import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, Trash2, Search, X, CheckCircle, Clock, AlertCircle, Pencil, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function KelolaDokumenPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kategoris, setKategoris] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  
  // Edit Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<any>(null);
  const [editForm, setEditForm] = useState({ judul: '', nomor: '', tahun: 0, jenis: '', instansi: '', abstrak: '', kata_kunci: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editErr, setEditErr] = useState('');
  
  // Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload Form State
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
      
      await api.post('/dokumen/unggah', fd, {
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
      try { 
        const res = await api.delete(`/dokumen/${id}`);
        const resData = res.data?.data || res.data;
        if (resData?.status === 'menunggu_persetujuan') {
          alert('Permintaan penghapusan telah dikirim ke Super Admin untuk persetujuan.');
        }
        fetchDokumen(); 
      } catch(e) { alert('Gagal menghapus') }
    }
  }

  // ========== EDIT FUNCTIONS ==========
  const openEditModal = (doc: any) => {
    setEditDoc(doc);
    setEditForm({
      judul: doc.judul || '',
      nomor: doc.nomor || '',
      tahun: doc.tahun || new Date().getFullYear(),
      jenis: doc.jenis || '',
      instansi: doc.instansi || '',
      abstrak: doc.abstrak || '',
      kata_kunci: (doc.kata_kunci || []).join(', '),
    });
    setEditErr('');
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editDoc) return;
    if (!editForm.judul) return setEditErr('Judul wajib diisi!');

    setEditLoading(true);
    setEditErr('');
    try {
      const payload: any = {
        judul: editForm.judul,
        nomor: editForm.nomor || undefined,
        tahun: Number(editForm.tahun),
        jenis: editForm.jenis,
        instansi: editForm.instansi,
        abstrak: editForm.abstrak || undefined,
      };
      // Parse kata kunci dari string koma-separated ke array
      if (editForm.kata_kunci.trim()) {
        payload.kata_kunci = editForm.kata_kunci.split(',').map((k: string) => k.trim()).filter(Boolean);
      }
      await api.patch(`/dokumen/${editDoc.id}`, payload);
      setEditOpen(false);
      fetchDokumen();
    } catch (error: any) {
      setEditErr(error.response?.data?.message || 'Gagal menyimpan perubahan');
    } finally {
      setEditLoading(false);
    }
  };

  // Filter data berdasarkan search
  const filteredData = data.filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (d.judul?.toLowerCase().includes(q)) || (d.jenis?.toLowerCase().includes(q)) || (d.instansi?.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Peraturan & Regulasi</h2>
          <p className="text-slate-500 text-sm mt-1">Unggah, edit, dan kelola dokumen regulasi PDF.</p>
        </div>
        <button onClick={openForm} className="flex items-center gap-2 bg-bpn hover:bg-bpn/90 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-bpn/20 transition-all active:scale-95 shrink-0">
          <UploadCloud className="w-5 h-5" /> Unggah .PDF
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari regulasi..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-200 outline-none focus:border-bpn focus:ring-2 focus:ring-bpn/20" 
              />
            </div>
            <div className="flex items-center text-xs text-slate-400 font-medium">
              {filteredData.length} dokumen
            </div>
         </div>
         <div className="overflow-x-auto min-h-[400px]">
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
                filteredData.map((d: any) => (
                <tr key={d.id} className="hover:bg-slate-50 group">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-800 text-sm">{d.judul}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <FileText className="w-3 h-3"/> PDF • {((Number(d.ukuran_file) || 0) / 1024 / 1024).toFixed(2)} MB • {d.instansi}
                    </p>
                    {d.kata_kunci && d.kata_kunci.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {d.kata_kunci.slice(0, 3).map((tag: string, idx: number) => (
                          <span key={idx} className="bg-bpn/10 text-bpn text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
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
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dokumen/${d.id}`} className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 rounded-lg transition" title="Lihat Detail">
                        <Eye className="w-4 h-4"/>
                      </Link>
                      <button onClick={() => openEditModal(d)} className="p-2 bg-slate-100 hover:bg-bpn/10 text-slate-500 hover:text-bpn rounded-lg transition" title="Edit Dokumen">
                        <Pencil className="w-4 h-4"/>
                      </button>
                      <button onClick={()=>hapusDokumen(d.id, d.judul)} className="p-2 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg transition" title="Hapus Dokumen">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && !loading && <tr><td colSpan={4} className="py-10 text-center text-slate-400">Berkas hukum masih kosong.</td></tr>}
            </tbody>
          </table>
         </div>
      </div>

      {/* ========== MODAL UPLOAD ========== */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between shrink-0">
              <h3 className="font-bold text-lg">Pendaftaran Dokumen Resmi</h3>
              <button disabled={uploading} onClick={()=>setIsOpen(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-800"/></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
              {err && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl font-medium border border-red-100 flex items-start gap-2"><AlertCircle className="w-5 h-5 shrink-0 mt-0.5"/> <span>{err}</span></div>}

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
                      <option value="Produk Hukum">Produk Hukum</option>
                      <option value="Peraturan Menteri">Peraturan Menteri</option>
                      <option value="Undang-undang">Undang-Undang</option>
                      <option value="SOP">SOP BPN</option>
                      <option value="Pedoman">Pedoman</option>
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

      {/* ========== MODAL EDIT DOKUMEN ========== */}
      {editOpen && editDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditOpen(false)}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-gradient-to-r from-bpn-dark to-bpn">
              <div className="flex items-center gap-3 text-white">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Edit Dokumen</h3>
                  <p className="text-xs text-white/60">Perbarui metadata regulasi</p>
                </div>
              </div>
              <button onClick={() => setEditOpen(false)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
              {editErr && (
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl font-medium border border-red-100 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> <span>{editErr}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold mb-1.5 block text-slate-700">Judul Regulasi <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={editForm.judul}
                    onChange={(e) => setEditForm({ ...editForm, judul: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-bpn/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-slate-700">Nomor</label>
                  <input
                    type="text"
                    value={editForm.nomor}
                    onChange={(e) => setEditForm({ ...editForm, nomor: e.target.value })}
                    placeholder="Contoh: 12/PRT/M/2024"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-bpn/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-slate-700">Tahun</label>
                  <input
                    type="number"
                    min="1945"
                    max="2050"
                    value={editForm.tahun}
                    onChange={(e) => setEditForm({ ...editForm, tahun: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-bpn/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-slate-700">Klasifikasi</label>
                  <select
                    value={editForm.jenis}
                    onChange={(e) => setEditForm({ ...editForm, jenis: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-bpn/20 outline-none cursor-pointer"
                  >
                    <option value="">Pilih klasifikasi...</option>
                    {kategoris.map((k: any) => <option key={k.id} value={k.nama}>{k.nama}</option>)}
                    <option value="Produk Hukum">Produk Hukum</option>
                    <option value="Peraturan Menteri">Peraturan Menteri</option>
                    <option value="Undang-undang">Undang-Undang</option>
                    <option value="SOP">SOP BPN</option>
                    <option value="Pedoman">Pedoman</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1.5 block text-slate-700">Instansi Penerbit</label>
                  <input
                    type="text"
                    value={editForm.instansi}
                    onChange={(e) => setEditForm({ ...editForm, instansi: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-bpn/20 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold mb-1.5 block text-slate-700">Abstrak / Ringkasan</label>
                  <textarea
                    rows={4}
                    value={editForm.abstrak}
                    onChange={(e) => setEditForm({ ...editForm, abstrak: e.target.value })}
                    placeholder="Ringkasan singkat isi dokumen..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-bpn/20 outline-none resize-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Jika dikosongkan, sistem AI (DeepSeek) akan meng-generate abstrak otomatis saat upload.</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold mb-1.5 block text-slate-700">Kata Kunci / Tags</label>
                  <input
                    type="text"
                    value={editForm.kata_kunci}
                    onChange={(e) => setEditForm({ ...editForm, kata_kunci: e.target.value })}
                    placeholder="HGU, Pendaftaran Tanah, PPID (pisahkan dengan koma)"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-bpn/20 outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Pisahkan setiap kata kunci dengan tanda koma.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0 rounded-b-2xl">
              <p className="text-[11px] text-slate-400">
                ID: <span className="font-mono">{editDoc.id?.substring(0, 12)}...</span>
              </p>
              <div className="flex gap-3">
                <button
                  disabled={editLoading}
                  onClick={() => setEditOpen(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition"
                >
                  Batal
                </button>
                <button
                  disabled={editLoading}
                  onClick={submitEdit}
                  className="px-5 py-2.5 bg-bpn hover:bg-bpn-dark disabled:bg-bpn/50 text-white rounded-xl text-sm font-bold shadow-md shadow-bpn/20 flex items-center gap-2 transition active:scale-95"
                >
                  {editLoading ? (
                    <><Clock className="w-4 h-4 animate-spin" /> Menyimpan...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Simpan Perubahan</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
