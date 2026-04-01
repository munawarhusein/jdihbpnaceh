export function Footer() {
  return (
    <footer className="bg-bpn-dark text-gray-300 py-12 px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div className="font-bold text-white text-xl mb-4">JDIH BPN Aceh</div>
          <p className="text-sm leading-relaxed mb-6 max-w-sm">
            Jaringan Dokumentasi dan Informasi Hukum Badan Pertanahan Nasional Provinsi Aceh.
            Merupakan sarana pemberian pelayanan informasi hukum secara mudah, cepat, dan akurat.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-white mb-4 text-lg">Tautan Cepat</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-bpn-gold transition">Beranda</a></li>
            <li><a href="#" className="hover:text-bpn-gold transition">Pencarian Lanjut</a></li>
            <li><a href="#" className="hover:text-bpn-gold transition">Kategori Dokumen</a></li>
            <li><a href="#" className="hover:text-bpn-gold transition">Hubungi Kami</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white mb-4 text-lg">Kontak</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="text-bpn-gold">Alamat:</span>
              <span>Jl. T. Nyak Arief, Lamgugob, Syiah Kuala, Banda Aceh</span>
            </li>
            <li className="flex gap-2">
              <span className="text-bpn-gold">Email:</span>
              <span>jdih@bpnaceh.go.id</span>
            </li>
            <li className="flex gap-2">
              <span className="text-bpn-gold">Telepon:</span>
              <span>(0651) 123456</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-12 pt-8 border-t border-gray-700 text-sm text-center">
        &copy; {new Date().getFullYear()} Kanwil BPN Provinsi Aceh. Hak Cipta Dilindungi.
      </div>
    </footer>
  );
}
