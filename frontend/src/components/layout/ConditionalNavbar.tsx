'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';

export function ConditionalNavbar() {
  const pathname = usePathname();
  if (pathname.startsWith('/dashboard')) return null;
  return <Navbar />;
}
