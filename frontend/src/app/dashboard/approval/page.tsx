'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface Permintaan {
  id: string;
  tipe_aksi: string;
  status: string;
  alasan: string;
  dibuat_pada: string;
  pemohon: { nama: string; email: string; jabatan: string; peran: string };
  penyetuju?: { nama: string };
  dokumen_id?: string;
}

export default function ApprovalPage() {
  const [permintaanList, setPermintaanList] = useState<Permintaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPermintaan = async () => {
    try {
      setLoading(true);
      const res = await api.get('/approval');
      // The backend returns an array of PermintaanAksi if the user is superadmin
      setPermintaanList(res.data.data || res.data);
      setErrorMsg('');
    } catch (error: any) {
      if (error.response?.status === 403) {
        setErrorMsg('Anda tidak memiliki akses ke halaman ini. Hanya Superadmin yang diizinkan.');
      } else {
        setErrorMsg('Gagal mengambil data permintaan persetujuan.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermintaan();
  }, []);

  const handleSetujui = async (id: string) => {
    if (!confirm('Anda yakin ingin menyetujui aksi ini?')) return;
    try {
      await api.post(`/approval/${id}/setujui`);
      fetchPermintaan();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menyetujui permintaan');
    }
  };

  const handleTolak = async (id: string) => {
    const alasan = prompt('Masukkan alasan penolakan:');
    if (alasan === null) return;
    try {
      await api.post(`/approval/${id}/tolak`, { alasan });
      fetchPermintaan();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menolak permintaan');
    }
  };

  if (loading) {
    return <div className="text-center p-12">Memuat data...</div>;
  }

  if (errorMsg) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-700 flex flex-col items-center justify-center">
        <ShieldAlert className="w-12 h-12 mb-4 text-red-500" />
        <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
        <p>{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Persetujuan Aksi (Approval)</h1>
        <p className="text-gray-500 mt-1">Kelola permintaan dari Admin yang membutuhkan persetujuan Superadmin.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {permintaanList.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
            <p>Tidak ada permintaan yang menunggu persetujuan pada saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Pemohon</th>
                  <th className="p-4">Tipe Aksi</th>
                  <th className="p-4">Keterangan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {permintaanList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="p-4 text-sm whitespace-nowrap">
                      {new Date(item.dibuat_pada).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{item.pemohon?.nama}</div>
                      <div className="text-xs text-gray-500">{item.pemohon?.jabatan || item.pemohon?.peran}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 uppercase">
                        {item.tipe_aksi}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-700 max-w-xs truncate" title={item.alasan}>
                      {item.alasan || '-'}
                    </td>
                    <td className="p-4">
                      {item.status === 'menunggu' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <Clock className="w-3.5 h-3.5" /> Menunggu
                        </span>
                      )}
                      {item.status === 'disetujui' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3.5 h-3.5" /> Disetujui
                        </span>
                      )}
                      {item.status === 'ditolak' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3.5 h-3.5" /> Ditolak
                        </span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {item.status === 'menunggu' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSetujui(item.id)}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleTolak(item.id)}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic border p-1 rounded bg-gray-50">
                          Oleh: {item.penyetuju?.nama || 'Unknown'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
