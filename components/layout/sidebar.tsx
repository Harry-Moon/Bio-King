'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Database,
  FileText,
  Trophy,
  Award,
  User,
  Settings,
  Upload,
  Stethoscope,
} from 'lucide-react';
import { UserMenu } from '@/components/auth/user-menu';
import { LanguageSelector } from '@/components/ui/language-selector';

const navItems = [
  {
    label: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Upload Rapport',
    href: '/upload',
    icon: Upload,
  },
  {
    label: 'Données',
    href: '/data',
    icon: Database,
  },
  {
    label: 'Rapports',
    href: '/reports',
    icon: FileText,
  },
  {
    label: 'Défis',
    href: '/challenges',
    icon: Trophy,
  },
  {
    label: 'Badges',
    href: '/badges',
    icon: Award,
  },
  {
    label: 'Profil',
    href: '/profile',
    icon: User,
  },
  {
    label: 'Paramètres',
    href: '/settings',
    icon: Settings,
  },
  {
    label: '🔧 Diagnostic',
    href: '/diagnostic',
    icon: Stethoscope,
  },
  {
    label: '🧪 Test OpenAI',
    href: '/test-openai',
    icon: Stethoscope,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 border-r bg-white md:block">
      <div className="flex h-full flex-col">
        {/* Logo / Titre */}
        <div className="border-b p-6">
          <h1 className="text-2xl font-bold text-primary">BioKing</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Language Selector */}
        <div className="border-t p-4">
          <LanguageSelector />
        </div>

        {/* User Menu */}
        <div className="border-t p-4">
          <UserMenu />
        </div>
      </div>
    </aside>
  );
}
