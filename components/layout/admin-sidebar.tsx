'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  Package,
  Users,
  PanelLeftOpen,
  PanelLeftClose,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { UserMenu } from '@/components/auth/user-menu';

const adminNavItems = [
  {
    label: 'Catalog',
    href: '/admin/catalog',
    icon: Package,
  },
  {
    label: 'Articles',
    href: '/admin/articles',
    icon: BookOpen,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const handleExitAdmin = () => {
    router.push('/dashboard');
  };

  return (
    <aside
      className={cn(
        'hidden h-screen border-r border-border bg-card transition-all duration-300 md:block',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      <div
        className="flex h-full flex-col"
        style={{
          background:
            'linear-gradient(to bottom, #0D2820 0%, #050505 50%, #08192A 100%)',
        }}
      >
        {/* Logo / Titre */}
        <div
          className="border-b border-border/50 p-4"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative flex h-6 w-6 flex-shrink-0 items-center justify-center transition-opacity"
              title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {/* Logo - affiché par défaut, masqué au survol */}
              <span
                className={cn(
                  'relative z-0 flex h-6 w-6 items-center justify-center transition-opacity duration-200',
                  isHovering ? 'opacity-0' : 'opacity-100'
                )}
                aria-hidden
              >
                <Image
                  src="/logo/logo.svg"
                  alt="BioKing"
                  width={24}
                  height={24}
                  unoptimized
                  className="h-6 w-6 object-contain"
                />
              </span>

              {/* Icône expand/collapse - uniquement au survol, au-dessus du logo */}
              {isHovering && (
                <span className="absolute inset-0 z-10 flex items-center justify-center">
                  {isOpen ? (
                    <PanelLeftClose className="h-6 w-6 text-green-500 animate-in fade-in duration-200" />
                  ) : (
                    <PanelLeftOpen className="h-6 w-6 text-green-500 animate-in fade-in duration-200" />
                  )}
                </span>
              )}
            </button>
            {isOpen && (
              <div className="flex flex-col">
                <h1 className="whitespace-nowrap text-xl font-bold text-green-500">
                  BioKing
                </h1>
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={cn('flex-1 space-y-1', isOpen ? 'p-3' : 'p-2')}>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                    : 'text-muted-foreground hover:bg-accent/50'
                )}
                title={!isOpen ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Exit Admin Button */}
        <div className="border-t border-border/50 p-3">
          <button
            onClick={handleExitAdmin}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-muted-foreground hover:bg-accent/50',
              !isOpen && 'justify-center'
            )}
            title={!isOpen ? 'Exit Admin' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isOpen && <span>Exit Admin</span>}
          </button>
        </div>

        {/* User Menu */}
        <div className="border-t border-border/50 p-3">
          <UserMenu isCollapsed={!isOpen} />
        </div>
      </div>
    </aside>
  );
}
