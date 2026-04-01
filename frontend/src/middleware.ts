import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Hanya membatasi akses pada path /dashboard beserta turunannya
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const accessToken = request.cookies.get('access_token');
    
    // Jika tidak ada token (belum login), kembalikan pengguna ke halaman '/login'
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Jika aman, lanjutkan proses request-nya
  return NextResponse.next();
}

// Menentukan rute mana saja yang akan dicegat oleh middleware
export const config = {
  matcher: ['/dashboard/:path*'],
};
