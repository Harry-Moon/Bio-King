'use client';

import { useAuth } from './auth-provider';
import { LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  isCollapsed?: boolean;
}

export function UserMenu({ isCollapsed = false }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  const email = user.email || '';
  const initials = email.split('@')[0].substring(0, 2).toUpperCase();

  return (
    <div className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={cn(
          'flex items-center rounded-lg transition-colors hover:bg-muted',
          isCollapsed ? 'mx-auto h-8 w-8 justify-center p-0' : 'gap-3 px-3 py-2'
        )}
        title={isCollapsed ? email : undefined}
      >
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground',
            isCollapsed ? 'h-8 w-8 text-xs' : 'h-8 w-8 text-xs'
          )}
        >
          {initials}
        </div>
        {!isCollapsed && (
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium">{email}</p>
          </div>
        )}
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu - Positionné vers le haut pour éviter de dépasser l'écran */}
          <div className="absolute right-0 bottom-full z-20 mb-2 w-48 rounded-lg border bg-card shadow-lg">
            <div className="p-2">
              <button
                onClick={() => {
                  setShowMenu(false);
                  // TODO: Navigate to profile
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <User className="h-4 w-4" />
                Mon profil
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  signOut();
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
