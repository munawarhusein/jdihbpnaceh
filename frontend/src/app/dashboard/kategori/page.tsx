'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle, Save, X } from 'lucide-react';
import api from '@/lib/api';

export default function KategoriPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ id: '', nama: '', keterangan: '', aktif: true });
  const [errorMSG, setErrorMSG] = useState('');

  const fetchKategori = async () => {
    try {
      const res = await api.get('/kategori');
      const apiData = res.data.data || res.data;
      setData(Array.isArray(apiData) ? apiData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKategori(); }, []);

  const openModal = (kategori = null) => {
    if (kategori) {
      setForm({ id: kategori.id, nama: kategori.nama, keterangan: kategori.keterangan || '', aktif: kategori.aktif });
    } else {
      setForm({ id: '', nama: '', keterangan: '', aktif: true });
    }
    setErrorMSG('');
    setIsOpen(true);
  };

  const saveKategori = async () => {
    try {
      setErrorMSG('');
      if (form.id) {
        await api.patch(`/kategori/${form.id}`, { nama: form.nama, keterangan: form.keterangan, aktif: form.aktif });
      } else {
        await api.post('/kategori', { nama: form.nama, keterangan: form.keterangan, aktif: form.aktif });
      }
      setIsOpen(false);
      fetchKategori();
    } catch (error: any) {
      setErrorMSG(error.response?.data?.message || 'Gagal menyimpan kategori');
    }
  };

  const hapusKategori = async (id: string, nama: string) => {
    if (confirm(`Yakin ingin menghapus kategori hukum: ${nama}?`)) {
      try {
        await api.delete(`/kategori/${id}`);
        fetchKategori();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Gagal menghapus');
      }
    }
  };

  const filterData = data.filter((k: any) => k.nama.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master Kategori Hukum</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola jenis hierarki dokumen (UU, Peraturan Daerah, dll).</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-bpn hover:bg-bpn/90 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-bpn/20 transition-all active:scale-95">
          <Plus className="w-5 h-5" /> Tambah Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari kategori..." 
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-200 outline-none focus:border-bpn focus:ring-2 focus:ring-bpn/20 transition-all bg-white"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="py-4 px-6 font-semibold w-12">No</th>
                <th className="py-4 px-6 font-semibold">Nama Kategori</th>
                <th className="py-4 px-6 font-semibold">Keterlambatan (Deskripsi)</th>
                <th className="py-4 px-6 font-semibold text-center">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">Memuat data...</td></tr>
              ) : filterData.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">Tidak ada kategori ditemukan.</td></tr>
              ) : filterData.map((k: any, i) => (
                <tr key={k.id} className="hover:bg-slate-50/80 transition group">
                  <td className="py-4 px-6 text-slate-500">{i + 1}</td>
                  <td className="py-4 px-6 font-bold text-slate-800">{k.nama}</td>
                  <td className="py-4 px-6 text-sm text-slate-500 truncate max-w-[200px]">{k.keterangan || '-'}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${k.aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {k.aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button onClick={() => openModal(k)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => hapusKategori(k.id, k.nama)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">{form.id ? 'Edit Kategori' : 'Kategori Baru'}</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {errorMSG && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 border border-red-100">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {errorMSG}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Resmi Kategori</label>
                <input 
                  type="text" 
                  value={form.nama} 
                  onChange={(e) => setForm({...form, nama: e.target.value})} 
                  placeholder="Cth: Peraturan Menteri"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-bpn focus:ring-2 focus:ring-bpn/20 outline-none text-sm transition font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Penjelasan (Opsional)</label>
                <textarea 
                  value={form.keterangan} 
                  onChange={(e) => setForm({...form, keterangan: e.target.value})} 
                  placeholder="Panduan penggunaan kategori..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-bpn focus:ring-2 focus:ring-bpn/20 outline-none text-sm transition h-24 resize-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="aktifkategori"
                  checked={form.aktif}
                  onChange={(e) => setForm({...form, aktif: e.target.checked})}
                  className="w-4 h-4 text-bpn rounded border-slate-300 focus:ring-bpn"
                />
                <label htmlFor="aktifkategori" className="text-sm font-medium text-slate-700 select-none cursor-pointer">Pasang sbg Aktif</label>
              </div>
            </div>
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button onClick={() => setIsOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition">Batal</button>
              <button onClick={saveKategori} className="px-5 py-2.5 rounded-xl font-semibold text-white bg-bpn hover:bg-bpn/90 shadow-md flex items-center gap-2 transition active:scale-95">
                <Save className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
