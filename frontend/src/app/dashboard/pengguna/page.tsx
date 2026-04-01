'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, UserCheck, Mail, ShieldAlert, X, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

export default function PenggunaPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ id: '', nama: '', email: '', kata_sandi: '', peran: 'pengelola' });
  const [err, setErr] = useState('');

  const fetchPengguna = async () => {
    try {
      const res = await api.get('/pengguna');
      const apiData = res.data.data || res.data;
      setData(Array.isArray(apiData) ? apiData : []);
    } catch(e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { fetchPengguna(); }, []);

  const hapusPengguna = async (id: string, nama: string) => {
    if(confirm(`Cabut akses & Hapus akun: ${nama}?`)) {
      try { await api.delete(`/pengguna/${id}`); fetchPengguna(); } 
      catch (e: any) { alert(e.response?.data?.message || 'Gagal menghapus') }
    }
  }

  const saveForm = async () => {
    try {
      setErr('');
      if (form.id) {
        await api.patch(`/pengguna/${form.id}`, { nama: form.nama, email: form.email, peran: form.peran, kata_sandi: form.kata_sandi || undefined });
      } else {
        await api.post('/pengguna', form);
      }
      setIsOpen(false);
      fetchPengguna();
    } catch(error:any) {
      setErr(Array.isArray(error.response?.data?.message) ? error.response.data.message[0] : error.response?.data?.message || 'Eror Server');
    }
  }

  const openForm = (u = null) => {
    setErr('');
    if (u) setForm({ id: u.id, nama: u.nama, email: u.email, peran: u.peran, kata_sandi: '' });
    else setForm({ id: '', nama: '', email: '', peran: 'pengelola', kata_sandi: '' });
    setIsOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Pengelola</h2>
          <p className="text-slate-500 text-sm mt-1">Atur akses otorisasi untuk Super Admin dan Pengelola Biro.</p>
        </div>
        <button onClick={() => openForm()} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-slate-900/20 transition-all">
          <UserCheck className="w-5 h-5" /> Daftarkan Akun
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-slate-500 font-semibold text-sm">Identitas</th>
                <th className="py-4 px-6 text-slate-500 font-semibold text-sm">Privilese (Peran)</th>
                <th className="py-4 px-6 text-slate-500 font-semibold text-sm">Dibuat Sejak</th>
                <th className="py-4 px-6 text-slate-500 font-semibold text-sm text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td colSpan={4} className="py-6 text-center text-slate-400">Loading...</td></tr> : 
                data.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-800">{u.nama}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5"><Mail className="w-3 h-3"/>{u.email}</p>
                  </td>
                  <td className="py-4 px-6">
                    {u.peran === 'admin' ? 
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md border border-red-200 flex items-center w-fit gap-1"><ShieldAlert className="w-3 h-3"/> Administrator</span> :
                      <span className="px-3 py-1 bg-bpn/10 text-bpn text-xs font-bold rounded-md border border-bpn/20">Staf Pengelola</span>
                    }
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-500">{new Date(u.dibuat_pada).toLocaleDateString('id-ID')}</td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button onClick={()=>openForm(u)} className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded-lg"><Edit2 className="w-4 h-4"/></button>
                    {(u.email !== 'admin@bpnaceh.go.id') && (
                      <button onClick={()=>hapusPengguna(u.id, u.nama)} className="p-2 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between">
              <h3 className="font-bold text-lg">{form.id ? 'Edit Pengguna' : 'Tambah Akun JDIH'}</h3>
              <button onClick={()=>setIsOpen(false)}><X className="w-5 h-5 text-slate-400"/></button>
            </div>
            <div className="p-6 space-y-4">
              {err && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex gap-2"><AlertCircle className="w-4 h-4 shrink-0"/> {err}</div>}
              <div>
                <label className="text-sm font-semibold mb-1 block">Nama Lengkap</label>
                <input type="text" value={form.nama} onChange={e=>setForm({...form, nama: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-bpn/20 outline-none" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Email Instansi</label>
                <input type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-bpn/20" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Kata Sandi {form.id && '(Opsional)'}</label>
                <input type="password" value={form.kata_sandi} placeholder={form.id ? 'Kosongkan jika tak diubah' : 'Minimal 6 Karakter'} onChange={e=>setForm({...form, kata_sandi: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-bpn/20" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Hak Kewenangan</label>
                <select value={form.peran} onChange={e=>setForm({...form, peran: e.target.value})} className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-bpn/20">
                  <option value="pengelola">👩‍💻 Pengelola Biasa</option>
                  <option value="admin">🦸‍♂️ Super Admin</option>
                </select>
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={()=>setIsOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-bold">Batal</button>
              <button onClick={saveForm} className="px-4 py-2 bg-bpn hover:bg-bpn-dark text-white rounded-lg text-sm font-bold shadow-md">Simpan Akun</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
