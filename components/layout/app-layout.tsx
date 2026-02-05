'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  // Pages publiques sans sidebar/nav
  const publicPages = ['/login', '/signup'];
  const isPublicPage = publicPages.includes(pathname);

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar pour desktop */}
      <Sidebar />

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
        <div className="container mx-auto p-6">{children}</div>
      </main>

      {/* Navigation mobile en bas */}
      <MobileNav />
    </div>
  );
}
