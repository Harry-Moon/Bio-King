'use client';

import { useAuth } from './auth-provider';
import { LogOut, User } from 'lucide-react';
import { useState } from 'react';

export function UserMenu() {
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
        className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {initials}
        </div>
        <div className="hidden text-left md:block">
          <p className="text-sm font-medium">{email}</p>
        </div>
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border bg-card shadow-lg">
            <div className="border-b p-3">
              <p className="truncate text-sm font-medium">{email}</p>
              <p className="text-xs text-muted-foreground">
                ID: {user.id.substring(0, 8)}...
              </p>
            </div>
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
