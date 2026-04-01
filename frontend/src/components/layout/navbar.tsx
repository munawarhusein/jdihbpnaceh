import Link from 'next/link';

export function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-bpn-dark rounded flex items-center justify-center text-white font-bold text-xl">
            BPN
          </div>
          <div>
            <div className="font-bold text-xl text-gray-900 leading-none">JDIH BPN ACEH</div>
            <div className="text-xs text-gray-500 mt-1">Kementerian Agraria dan Tata Ruang</div>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link href="/" className="text-bpn-dark hover:text-bpn transition">Beranda</Link>
          <Link href="/dokumen" className="text-gray-600 hover:text-bpn transition">Dokumen Hukum</Link>
          <Link href="/tentang" className="text-gray-600 hover:text-bpn transition">Tentang Kami</Link>
          <Link href="/statistik" className="text-gray-600 hover:text-bpn transition">Statistik</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded transition">
            Masuk
          </Link>
        </div>
      </div>
    </header>
  );
}
