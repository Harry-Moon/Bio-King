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

  // Pages admin : ne pas afficher la sidebar publique (elles ont leur propre layout)
  const isAdminPage = pathname.startsWith('/admin');

  if (isPublicPage || isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar pour desktop */}
      <Sidebar />

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto bg-background pb-16 md:pb-0">
        <div className="container mx-auto p-6">{children}</div>
      </main>

      {/* Navigation mobile en bas */}
      <MobileNav />
    </div>
  );
}
