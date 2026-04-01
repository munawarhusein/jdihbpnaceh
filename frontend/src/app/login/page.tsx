'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await api.post('/auth/login', {
        email,
        kata_sandi: password
      });

      const data = response.data.data || response.data;
      const { akses_token, refresh_token } = data;
      
      if (akses_token) {
        Cookies.set('access_token', akses_token, { expires: 1 }); 
      }
      if (refresh_token) {
        Cookies.set('refresh_token', refresh_token, { expires: 7 });
      }

      router.push('/dashboard');
      
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response && error.response.status === 401) {
        setErrorMsg(error.response.data?.message || 'Email atau kata sandi tidak valid. Silakan coba lagi.');
      } else if (error.response && error.response.status === 400) {
        // Tangkap pesan validasi DTO dari NestJS
        Array.isArray(error.response.data?.message) 
          ? setErrorMsg(error.response.data.message[0])
          : setErrorMsg('Validasi gagal: Cek kembali isian Anda.');
      } else {
        setErrorMsg('Terjadi kesalahan koneksi server. Pastikan backend sudah menyala.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-bpn-dark rounded flex items-center justify-center text-white font-bold text-2xl mb-4">
            <Building className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Selamat Datang</h2>
          <p className="text-gray-500 text-sm mt-1">Masuk ke Dasbor Admin JDIH BPN Aceh</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Admin / Pengelola</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpn focus:border-transparent transition"
              placeholder="admin@bpnaceh.go.id"
              required 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Kata Sandi</label>
              <a href="#" className="text-sm text-bpn hover:underline font-medium">Lupa sandi?</a>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bpn focus:border-transparent transition"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white font-bold py-3 px-4 rounded-md transition shadow-md flex justify-center items-center ${loading ? 'bg-bpn/70 cursor-not-allowed' : 'bg-bpn hover:bg-bpn/90'}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Hanya untuk pegawai internal BPN. Buka <Link href="/" className="text-bpn font-medium hover:underline">Beranda</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
