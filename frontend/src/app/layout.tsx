import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ConditionalNavbar } from '@/components/layout/ConditionalNavbar';
import { ConditionalFooter } from '@/components/layout/ConditionalFooter';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JDIH BPN Aceh',
  description: 'Jaringan Dokumentasi dan Informasi Hukum Badan Pertanahan Nasional Provinsi Aceh',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ConditionalNavbar />
        <main className="flex-1">
          {children}
        </main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
