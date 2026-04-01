'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { FileText, Eye, CheckCircle, Clock, TrendingUp, Download, ArrowUpRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface DashboardData {
  total_dokumen: number;
  total_kunjungan: number;
  total_ocr: number;
  dokumen_baru: number;
  chart_pertumbuhan: { name: string; dokumen: number }[];
  chart_aktivitas: { name: string; lihat: number; unduh: number }[];
  dokumen_terbaru: {
    id: string;
    judul: string;
    jenis: string;
    dibuat_pada: string;
    status_ocr: string;
    ukuran_file: number | string;
  }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/analytics/ringkasan');
        const d = res.data.data || res.data;
        setData(d);
      } catch (err: any) {
        console.error('Gagal mengambil data dashboard', err);
        setError('Gagal memuat data dashboard. Pastikan Anda memiliki akses admin.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-pulse">
          <div className="h-6 w-48 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-slate-100 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
              <div className="h-4 w-24 bg-slate-200 rounded mb-3"></div>
              <div className="h-8 w-16 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">Gagal Memuat Dashboard</h3>
        <p className="text-slate-500 text-sm">{error || 'Data tidak tersedia.'}</p>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Total Dokumen', 
      value: data.total_dokumen.toLocaleString('id-ID'), 
      icon: FileText, 
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      textColor: 'text-blue-600',
      description: 'Seluruh dokumen hukum dalam sistem'
    },
    { 
      label: 'Terekstraksi (OCR)', 
      value: data.total_ocr.toLocaleString('id-ID'), 
      icon: CheckCircle, 
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      textColor: 'text-emerald-600',
      description: `${data.total_dokumen > 0 ? Math.round((data.total_ocr / data.total_dokumen) * 100) : 0}% tingkat keberhasilan`
    },
    { 
      label: 'Total Kunjungan', 
      value: data.total_kunjungan.toLocaleString('id-ID'), 
      icon: Eye, 
      gradient: 'from-violet-500 to-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      textColor: 'text-violet-600',
      description: 'Akses publik & admin'
    },
    { 
      label: 'Dokumen Baru', 
      value: data.dokumen_baru.toLocaleString('id-ID'), 
      icon: TrendingUp, 
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      textColor: 'text-amber-600',
      description: 'Penambahan bulan ini'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-br from-bpn-dark to-bpn p-8 rounded-2xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold">Ringkasan Sistem JDIH</h2>
          <p className="text-white/70 text-sm mt-1">Pantau statistik dan pergerakan data JDIH BPN Kanwil Aceh secara <em>real-time</em>.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-white rounded-2xl p-6 shadow-sm border ${stat.border} hover:shadow-md transition-all duration-300 group relative overflow-hidden`}>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-slate-50 rounded-full group-hover:scale-[2] transition-transform duration-700 ease-out z-0"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">{stat.value}</h3>
              <p className={`text-xs font-medium ${stat.textColor}`}>{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart - Pertumbuhan */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Pertumbuhan Dokumen</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tahun {new Date().getFullYear()}</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {data.chart_pertumbuhan && data.chart_pertumbuhan.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chart_pertumbuhan} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDokumen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1b4d3e" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#1b4d3e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="dokumen" stroke="#1b4d3e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDokumen)" dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Belum ada data pertumbuhan.</div>
            )}
          </div>
        </div>

        {/* Secondary Chart - Aktivitas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-6">
            <h3 className="font-bold text-lg text-slate-800">Aktivitas Publik</h3>
            <p className="text-xs text-slate-400 mt-0.5">7 hari terakhir</p>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            {data.chart_aktivitas && data.chart_aktivitas.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chart_aktivitas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">Belum ada data aktivitas.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Documents Table - REAL DATA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Dokumen Hukum Terbaru</h3>
            <p className="text-xs text-slate-400 mt-0.5">5 dokumen terakhir yang diunggah</p>
          </div>
          <Link href="/admin/dokumen" className="flex items-center gap-1 text-sm font-medium text-bpn hover:text-bpn-dark transition">
            Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
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
              {data.dokumen_terbaru && data.dokumen_terbaru.length > 0 ? (
                data.dokumen_terbaru.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition group">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800 text-sm group-hover:text-bpn transition truncate max-w-xs">{row.judul}</p>
                      <p className="text-xs text-slate-400 mt-1">{(Number(row.ukuran_file || 0) / 1024 / 1024).toFixed(2)} MB</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                        {row.jenis}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 font-medium">
                      {new Date(row.dibuat_pada).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6">
                      {row.status_ocr === 'selesai' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Terekstraksi
                        </span>
                      ) : row.status_ocr === 'diproses' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Memproses
                        </span>
                      ) : row.status_ocr === 'gagal' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Gagal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Menunggu
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link href={`/dokumen/${row.id}`} className="text-slate-400 hover:text-bpn font-medium text-sm transition px-2 py-1 rounded hover:bg-slate-100 inline-flex items-center gap-1">
                        Detail <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 px-6 text-center text-slate-400 text-sm">
                    Belum ada dokumen yang diunggah.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
