'use client';

import Link from 'next/link';
import Image from 'next/image';

/**
 * En-tête avec logo et nom de l'app, visible uniquement sur mobile
 */
export function MobileHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center border-b border-border/50 bg-card px-4 md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Image
          src="/logo/logo.svg"
          alt="BioKing"
          width={28}
          height={28}
          unoptimized
          className="h-7 w-7 object-contain"
        />
        <span className="text-lg font-bold text-green-500">BioKing</span>
      </Link>
    </header>
  );
}
