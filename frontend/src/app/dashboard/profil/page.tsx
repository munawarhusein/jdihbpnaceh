'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Phone, Building2, Save } from 'lucide-react';
import api from '@/lib/api';
import Cookies from 'js-cookie';

interface Profil {
  id: string;
  nama: string;
  email: string;
  peran: string;
  jabatan: string | null;
  nip: string | null;
  unit_kerja: string | null;
  no_telepon: string | null;
}

export default function ProfilPage() {
  const [profil, setProfil] = useState<Profil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // State for form fields
  const [formData, setFormData] = useState({
    nama: '',
    jabatan: '',
    nip: '',
    unit_kerja: '',
    no_telepon: ''
  });

  useEffect(() => {
    fetchProfil();
  }, []);

  const fetchProfil = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profil/saya');
      const data = res.data.data || res.data;
      setProfil(data);
      setFormData({
        nama: data.nama || '',
        jabatan: data.jabatan || '',
        nip: data.nip || '',
        unit_kerja: data.unit_kerja || '',
        no_telepon: data.no_telepon || ''
      });
    } catch (error) {
      console.error('Failed to fetch profil:', error);
      setMessage({ type: 'error', text: 'Gagal mengambil data profil' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      await api.patch('/profil/saya', formData);
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui' });
      fetchProfil(); // refresh data
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal memperbarui profil' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat profil...</div>;
  if (!profil) return <div className="p-8 text-center text-red-500">Profil tidak ditemukan.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-gray-500">Kelola informasi pribadi dan data kepegawaian Anda.</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl border ${message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-10">
        
        {/* Left Side: Photo & Quick Info */}
        <div className="w-full md:w-1/3 flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-100 pb-8 md:pb-0 md:pr-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-bpn to-bpn-dark flex items-center justify-center text-white text-4xl shadow-lg mb-6 shadow-bpn/20">
            <span className="font-bold">{profil.nama.substring(0, 2).toUpperCase()}</span>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 text-center">{profil.nama}</h2>
          <p className="text-gray-500 font-medium mb-4">{profil.jabatan || 'Staf / Pengelola'}</p>
          
          <div className="w-full space-y-3 mt-4">
            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
              <Mail className="w-4 h-4 text-bpn shrink-0" />
              <span className="truncate">{profil.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
              <User className="w-4 h-4 text-bpn shrink-0" />
              <span className="uppercase font-semibold tracking-wide text-xs bg-bpn/10 px-2 rounded-full py-0.5 text-bpn">
                {profil.peran}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bpn/20 focus:border-bpn outline-none transition-all bg-gray-50 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  No Telepon / WA
                </label>
                <input
                  type="text"
                  name="no_telepon"
                  value={formData.no_telepon}
                  onChange={handleChange}
                  placeholder="0812xxxxxx"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bpn/20 focus:border-bpn outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  NIP
                </label>
                <input
                  type="text"
                  name="nip"
                  value={formData.nip}
                  onChange={handleChange}
                  placeholder="xxxxxxxx xxxxxxxxxx"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bpn/20 focus:border-bpn outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  Jabatan
                </label>
                <input
                  type="text"
                  name="jabatan"
                  value={formData.jabatan}
                  onChange={handleChange}
                  placeholder="Contoh: Pengelola JDIH"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bpn/20 focus:border-bpn outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  Unit Kerja / Satuan Kerja
                </label>
                <input
                  type="text"
                  name="unit_kerja"
                  value={formData.unit_kerja}
                  onChange={handleChange}
                  placeholder="Contoh: Seksi Pengadaan Tanah, Kanwil BPN Aceh"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-bpn/20 focus:border-bpn outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-bpn text-white px-6 py-2.5 rounded-lg hover:bg-bpn/90 transition shadow-sm font-medium disabled:opacity-70"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
