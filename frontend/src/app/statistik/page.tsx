'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FileText, CalendarDays, Clock } from 'lucide-react';
import api from '@/lib/api';

interface StatsPublik {
  total_dokumen: number;
  berdasarkan_jenis: { name: string; count: number }[];
  berdasarkan_tahun: { name: number; count: number }[];
}

export default function StatistikPage() {
  const [stats, setStats] = useState<StatsPublik | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/publik');
        setStats(res.data.data || res.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="bg-gray-50 flex flex-col pt-0">
      {/* Title Section */}
      <div className="bg-white border-b border-gray-200 py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <h1 className="text-3xl font-bold text-gray-900">Statistik JDIH</h1>
          <p className="text-gray-500 mt-2">Gambaran umum koleksi dokumen hukum pada Jaringan Dokumentasi dan Informasi Hukum Kanwil BPN Aceh.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 flex-1 max-w-5xl">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bpn"></div>
          </div>
        ) : !stats ? (
          <div className="text-center py-20 text-gray-500">Gagal memuat statistik.</div>
        ) : (
          <div className="space-y-10">
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-bpn/10 flex items-center justify-center text-bpn">
                  <FileText size={28} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Dokumen Aktif</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.total_dokumen}</h3>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <CalendarDays size={28} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Tahun Terlama</p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {stats.berdasarkan_tahun.length > 0 ? stats.berdasarkan_tahun[0].name : '-'}
                  </h3>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Clock size={28} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Update Terakhir</p>
                  <h3 className="text-xl font-bold text-gray-900">Hari ini</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Produk Hukum Berdasarkan Jenis</h3>
                <div className="h-80 w-full relative">
                  {stats.berdasarkan_jenis.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.berdasarkan_jenis}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {stats.berdasarkan_jenis.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => [`${value} Dokumen`, 'Jumlah']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">Belum ada data</div>
                  )}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Produk Hukum Berdasarkan Tahun</h3>
                <div className="h-80 w-full relative">
                  {stats.berdasarkan_tahun.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.berdasarkan_tahun} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          cursor={{ fill: '#F3F4F6' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" name="Jumlah Dokumen" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">Belum ada data</div>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
