'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Mengecek apakah user sudah login dengan melihat keberadaan cookie access_token
    const token = Cookies.get('access_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100/50 sticky top-0 z-50 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 relative z-10 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bpn to-bpn-dark flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-bpn/20 group-hover:scale-105 transition-transform duration-300">
            BPN
          </div>
          <div>
            <div className="font-bold text-xl text-gray-900 leading-none">JDIH BPN ACEH</div>
            <div className="text-xs text-gray-500 mt-1 hidden sm:block">Kementerian Agraria dan Tata Ruang</div>
          </div>
        </Link>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-2 font-medium">
          <Link href="/" className="px-4 py-2 text-gray-700 hover:text-bpn hover:bg-bpn/5 rounded-lg transition-all duration-300 relative group">
            Beranda
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-bpn -translate-x-1/2 group-hover:w-1/2 transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-full"></span>
          </Link>
          <Link href="/dokumen" className="px-4 py-2 text-gray-700 hover:text-bpn hover:bg-bpn/5 rounded-lg transition-all duration-300 relative group">
            Dokumen Hukum
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-bpn -translate-x-1/2 group-hover:w-1/2 transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-full"></span>
          </Link>
          <Link href="/tentang" className="px-4 py-2 text-gray-700 hover:text-bpn hover:bg-bpn/5 rounded-lg transition-all duration-300 relative group">
            Tentang Kami
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-bpn -translate-x-1/2 group-hover:w-1/2 transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-full"></span>
          </Link>
          <Link href="/statistik" className="px-4 py-2 text-gray-700 hover:text-bpn hover:bg-bpn/5 rounded-lg transition-all duration-300 relative group">
            Statistik
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-bpn -translate-x-1/2 group-hover:w-1/2 transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-full"></span>
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <Link href="/dashboard" className="px-6 py-2.5 bg-gradient-to-r from-bpn to-bpn-dark text-white font-semibold hover:shadow-lg hover:shadow-bpn/30 hover:-translate-y-0.5 rounded-xl transition-all duration-300">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="px-6 py-2.5 text-gray-700 font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-300">
              Masuk
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="md:hidden p-2 text-gray-600 hover:text-bpn relative z-10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col p-6 space-y-3 font-medium text-center">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-bpn hover:bg-bpn/5 p-3 rounded-xl transition-colors">Beranda</Link>
            <Link href="/dokumen" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-bpn hover:bg-bpn/5 p-3 rounded-xl transition-colors">Dokumen Hukum</Link>
            <Link href="/tentang" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-bpn hover:bg-bpn/5 p-3 rounded-xl transition-colors">Tentang Kami</Link>
            <Link href="/statistik" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-bpn hover:bg-bpn/5 p-3 rounded-xl transition-colors">Statistik</Link>
            <div className="pt-4 mt-2 border-t border-gray-100">
              {isLoggedIn ? (
                <Link href="/dashboard" className="block w-full px-5 py-3.5 bg-gradient-to-r from-bpn to-bpn-dark text-white rounded-xl shadow-lg shadow-bpn/20 font-semibold">Dashboard</Link>
              ) : (
                <Link href="/login" className="block w-full px-5 py-3.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold">Masuk</Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
