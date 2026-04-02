import { Building, Phone, Mail, MapPin, Globe } from 'lucide-react';


export const metadata = {
  title: 'Tentang Kami - JDIH BPN Aceh',
  description: 'Informasi tentang Jaringan Dokumentasi dan Informasi Hukum Kanwil BPN Provinsi Aceh',
};

export default function TentangPage() {
  return (
    <div className="bg-gray-50 flex flex-col pt-0">
      {/* Hero Section */}
      <div className="bg-bpn-dark py-16 md:py-24 relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[150%] rounded-full bg-gradient-to-tr from-bpn/20 to-transparent blur-3xl transform rotate-12"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[100%] rounded-full bg-gradient-to-tr from-bpn/20 to-transparent blur-3xl transform -rotate-12"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">Tentang JDIH BPN Aceh</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Wadah pendayagunaan bersama atas dokumen hukum secara tertib, terpadu, dan berkesinambungan 
            pada Kantor Wilayah Badan Pertanahan Nasional Provinsi Aceh.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16 flex-1 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Left Column - Visi Misi */}
          <div className="md:col-span-2 space-y-12">
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-bpn/10 flex items-center justify-center text-bpn">
                  <Building size={24} />
                </div>
                Latar Belakang
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Jaringan Dokumentasi dan Informasi Hukum (JDIH) Kementerian Agraria dan Tata Ruang/Badan Pertanahan Nasional 
                  adalah wadah pendayagunaan bersama atas dokumen hukum secara tertib, terpadu, dan berkesinambungan, serta 
                  merupakan sarana pemberian pelayanan informasi hukum secara cepat, mudah, lengkap dan akurat.
                </p>
                <p>
                  Keberadaan JDIH dimaksudkan untuk menjamin terciptanya pengelolaan dokumentasi dan informasi hukum yang 
                  terpadu dan terintegrasi di berbagai instansi pemerintah dan institusi lainnya.
                </p>
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-bpn/10 flex items-center justify-center text-bpn">
                  <Globe size={24} />
                </div>
                Tujuan JDIH
              </h2>
              <ul className="space-y-4 text-gray-600">
                {[
                  "Menjamin terciptanya pengelolaan dokumentasi dan informasi hukum yang terpadu dan terintegrasi",
                  "Menjamin ketersediaan dokumentasi dan informasi hukum yang lengkap dan akurat",
                  "Mengembangkan kerja sama yang efektif antara Pusat Jaringan dan Anggota Jaringan",
                  "Meningkatkan kualitas pembangunan hukum nasional dan pelayanan kepada publik"
                ].map((tujuan, i) => (
                  <li key={i} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-bpn text-white flex items-center justify-center shrink-0 font-bold">
                      {i + 1}
                    </div>
                    <span className="mt-1 leading-relaxed">{tujuan}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Right Column - Contact Card */}
          <div className="md:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-28 border-t-4 border-t-bpn">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Hubungi Kami</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-bpn group-hover:text-white transition-colors">
                    <MapPin size={20} className="text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Alamat</h4>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      Jl. T. Nyak Arief No.Km. 175, Jeulingke, Kec. Syiah Kuala, Kota Banda Aceh, Aceh 23114
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-bpn group-hover:text-white transition-colors">
                    <Phone size={20} className="text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Telepon</h4>
                    <p className="text-sm text-gray-500 mt-1">(0651) 7551700</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-bpn group-hover:text-white transition-colors">
                    <Mail size={20} className="text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-sm text-gray-500 mt-1">aceh@atrbpn.go.id</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.0450529524024!2d95.34151740926715!3d5.560295194406307!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x304037abb5b53e83%3A0x67ee1c2e2691eef!2sKantor%20Wilayah%20BPN%20Provinsi%20Aceh!5e0!3m2!1sid!2sid!4v1714000000000!5m2!1sid!2sid" 
                  width="100%" 
                  height="250" 
                  style={{ border: 0, borderRadius: '12px' }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="bg-gray-100"
                ></iframe>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
