'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Database,
  FileText,
  User,
  Settings,
  Upload,
  ChevronLeft,
  ChevronRight,
  Dna,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react';
import { UserMenu } from '@/components/auth/user-menu';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Upload Report',
    href: '/upload',
    icon: Upload,
  },
  {
    label: 'Biomarkers',
    href: '/data',
    icon: Database,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: FileText,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <aside
      className={cn(
        'hidden h-screen border-r border-border bg-card transition-all duration-300 md:block',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo / Titre */}
        <div
          className="border-b border-border/50 p-4"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="flex items-center gap-2">
            {/* Icon Container */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative flex h-6 w-6 flex-shrink-0 items-center justify-center transition-opacity"
              title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {/* DNA Icon - Hidden on hover */}
              <Dna
                className={cn(
                  'h-6 w-6 text-green-500 transition-opacity duration-200',
                  isHovering ? 'opacity-0' : 'opacity-100'
                )}
              />

              {/* Action Icon - Shown on hover */}
              {isHovering && (
                <>
                  {isOpen ? (
                    <PanelLeftClose className="absolute h-6 w-6 text-green-500 animate-in fade-in duration-200" />
                  ) : (
                    <PanelLeftOpen className="absolute h-6 w-6 text-green-500 animate-in fade-in duration-200" />
                  )}
                </>
              )}
            </button>

            {isOpen && (
              <h1 className="whitespace-nowrap text-xl font-bold text-green-500">
                BioKing
              </h1>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={cn('flex-1 space-y-1', isOpen ? 'p-3' : 'p-2')}>
          {navItems.map((item) => {
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

        {/* User Menu */}
        <div className="border-t border-border/50 p-3">
          <UserMenu />
        </div>
      </div>
    </aside>
  );
}
