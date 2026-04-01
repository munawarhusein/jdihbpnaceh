'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { FileText, Eye, CheckCircle, Clock, TrendingUp, Download } from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    total_dokumen: 0,
    total_dikunjungi: 0,
    dokumen_ocr: 0,
    dokumen_baru: 0
  });
  const [loading, setLoading] = useState(true);

  // Dummy Chart Data
  const dataPertumbuhan = [
    { name: 'Jan', dokumen: 4 },
    { name: 'Feb', dokumen: 7 },
    { name: 'Mar', dokumen: 12 },
    { name: 'Apr', dokumen: 15 },
    { name: 'Mei', dokumen: 22 },
    { name: 'Jun', dokumen: 30 },
  ];

  const dataAktivitas = [
    { name: 'Senin', unduh: 40, lihat: 120 },
    { name: 'Selasa', unduh: 30, lihat: 98 },
    { name: 'Rabu', unduh: 45, lihat: 150 },
    { name: 'Kamis', unduh: 60, lihat: 180 },
    { name: 'Jumat', unduh: 35, lihat: 110 },
  ];

  useEffect(() => {
    const fetchRingkasan = async () => {
      try {
        const res = await api.get('/analytics/ringkasan');
        // Backend return bisa bervariasi, kita asumsikan struktur ini:
        setMetrics({
          total_dokumen: res.data.total_dokumen || 154,
          total_dikunjungi: res.data.total_kunjungan || 8920,
          dokumen_ocr: res.data.total_ocr || 142,
          dokumen_baru: 12 // Data bulan ini
        });
      } catch (error) {
        console.error('Gagal mengambil metrik', error);
        // Fallback UI
        setMetrics({ total_dokumen: 120, total_dikunjungi: 5430, dokumen_ocr: 90, dokumen_baru: 5 });
      } finally {
        setLoading(false);
      }
    };

    fetchRingkasan();
  }, []);

  const stats = [
    { 
      label: 'Total Dokumen', 
      value: metrics.total_dokumen.toLocaleString(), 
      icon: FileText, 
      color: 'bg-blue-500', 
      trend: '+12% bulan ini' 
    },
    { 
      label: 'Dokumen Terekstraksi (OCR)', 
      value: metrics.dokumen_ocr.toLocaleString(), 
      icon: CheckCircle, 
      color: 'bg-green-500', 
      trend: '92% keberhasilan' 
    },
    { 
      label: 'Total Kunjungan Publik', 
      value: metrics.total_dikunjungi.toLocaleString(), 
      icon: Eye, 
      color: 'bg-bpn', 
      trend: '+450 minggu ini' 
    },
    { 
      label: 'Pembaruan Menunggu', 
      value: '3', 
      icon: Clock, 
      color: 'bg-amber-500', 
      trend: 'Perlu tinjauan' 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ringkasan Sistem</h2>
          <p className="text-slate-500 text-sm mt-1">Pantau statistik dan pergerakan data JDIH Anda secara *real-time*.</p>
        </div>
        <button className="flex items-center gap-2 bg-bpn-dark hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition shadow-md shadow-slate-200">
          <Download className="w-4 h-4" /> Unduh Laporan PDF
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out z-0"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">{stat.label}</p>
                {loading ? (
                  <div className="h-8 w-24 bg-slate-200 animate-pulse rounded mt-2"></div>
                ) : (
                  <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</h3>
                )}
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            
            <div className="relative z-10 mt-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-slate-500">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">Pertumbuhan Dokumen Hukum (2024)</h3>
            <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-bpn hover:bg-slate-100 transition cursor-pointer">
              <option>6 Bulan Terakhir</option>
              <option>Tahun Ini</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataPertumbuhan} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="dokumen" fill="#1b4d3e" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Aktivitas Publik Harian</h3>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataAktivitas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="lihat" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Dilihat" />
                <Line type="monotone" dataKey="unduh" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} name="Diunduh" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-800">Dokumen Hukum Terbaru</h3>
          <button className="text-sm font-medium text-bpn hover:text-bpn-dark transition">Lihat Semua</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Judul Dokumen</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal Input</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status OCR</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { title: 'Peraturan Menteri ATR/BPN No 10 Tahun 2024', cat: 'Peraturan Menteri', date: 'Hari ini, 09:30', ocr: true },
                { title: 'SK Kakanwil BPN Provinsi Aceh tentang Petunjuk Teknis', cat: 'Keputusan', date: 'Kemarin, 14:15', ocr: true },
                { title: 'Edaran Penertiban Arsip Digital', cat: 'Surat Edaran', date: '28 Mar 2024', ocr: false },
                { title: 'SOP Pelayanan Informasi Publik', cat: 'SOP', date: '25 Mar 2024', ocr: true },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition cursor-pointer group">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-800 text-sm group-hover:text-bpn transition">{row.title}</p>
                    <p className="text-xs text-slate-400 mt-1">12 Hal • PDF • 1.2 MB</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                      {row.cat}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-500 font-medium">{row.date}</td>
                  <td className="py-4 px-6">
                    {row.ocr ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Terekstraksi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Memproses
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-slate-400 hover:text-bpn font-medium text-sm transition px-2 py-1 rounded hover:bg-slate-100">
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
