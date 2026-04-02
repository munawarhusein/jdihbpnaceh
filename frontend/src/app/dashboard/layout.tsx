'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Building, 
  LayoutDashboard, 
  FolderOpen, 
  Tags, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search
} from 'lucide-react';
import Cookies from 'js-cookie';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Fix: Cek isMobile hanya di client-side (setelah komponen dimount) untuk mencegah SSR "window is not defined" crash.
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize(); // trigger pertama kali
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    router.push('/login');
  };

  const menuItems = [
    { label: 'Ringkasan', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Kelola Dokumen', icon: FolderOpen, href: '/dashboard/dokumen' },
    { label: 'Kategori Hukum', icon: Tags, href: '/dashboard/kategori' },
    { label: 'Pengguna', icon: Users, href: '/dashboard/pengguna' },
    { label: 'Persetujuan Aksi', icon: Bell, href: '/dashboard/approval' },
    { label: 'Profil Saya', icon: Users, href: '/dashboard/profil' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        />
      )}

      {/* Sidebar (Premium Dark Theme) */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-slate-900 text-slate-300
        transform transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}
        flex flex-col border-r border-slate-800 shadow-2xl
      `}>
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900 overflow-hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded bg-bpn flex items-center justify-center shrink-0 shadow-lg shadow-bpn/30 transition-all ${!isSidebarOpen && 'lg:mx-auto'}`}>
              <Building className="w-6 h-6 text-white" />
            </div>
            {(isSidebarOpen || isMobile) && (
              <div className="flex flex-col transition-opacity duration-300">
                <span className="text-white font-bold text-lg tracking-wide">JDIH Admin</span>
                <span className="text-xs text-slate-400 font-medium">BPN Provinsi Aceh</span>
              </div>
            )}
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white p-1">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Menu Navigation */}
        <div className="flex-1 py-6 px-4 overflow-y-auto custom-scrollbar flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="block">
                <div className={`
                  flex items-center gap-4 px-4 py-3.5 rounded-xl
                  transition-all duration-300 ease-in-out group relative overflow-hidden
                  ${isActive 
                    ? 'bg-bpn text-white shadow-lg shadow-bpn/20' 
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'}
                `}>
                  <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${!isActive && 'group-hover:scale-110'}`} />
                  {(isSidebarOpen || isMobile) && (
                    <span className="font-semibold text-sm whitespace-nowrap z-10">{item.label}</span>
                  )}
                  {/* Hover effect backdrop */}
                  {!isActive && <div className="absolute inset-0 bg-gradient-to-r from-slate-700/0 via-slate-700/0 to-slate-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 absolute" />}
                </div>
              </Link>
            );
          })}
        </div>

        {/* User Info / Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <button 
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-4 px-4 py-3.5 rounded-xl
              text-slate-400 hover:text-red-400 hover:bg-red-400/10
              transition-all duration-300 group
              ${!isSidebarOpen && 'lg:justify-center'}
            `}
          >
            <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-1" />
            {(isSidebarOpen || isMobile) && (
              <span className="font-semibold text-sm whitespace-nowrap">Keluar Sesi</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Top Navbar */}
        <header className="h-20 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">Panel Kendali</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer">
              <div className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="flex flex-col text-right hidden sm:block">
                <span className="text-sm font-bold text-slate-800 leading-none">Admin Pusat</span>
                <span className="text-xs font-medium text-slate-500 mt-1">Super Administrator</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bpn to-bpn-dark flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow">
                <span className="font-bold text-sm">AD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-10 page-fade-in relative">
          {children}
        </div>
      </main>
    </div>
  );
}
