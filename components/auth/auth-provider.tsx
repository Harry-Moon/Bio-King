'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '@/lib/auth/supabase-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/ceb253d4-8810-4458-a8e9-df161de7da4a', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'auth-provider.tsx:22',
      message: 'AuthProvider render start',
      data: {
        windowDefined: typeof window !== 'undefined',
        isServer: typeof window === 'undefined',
      },
      timestamp: Date.now(),
      runId: 'run1',
      hypothesisId: 'A',
    }),
  }).catch(() => {});
  // #endregion

  // Créer le client uniquement côté client (lazy initialization)
  const [supabase] = useState(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/ceb253d4-8810-4458-a8e9-df161de7da4a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'auth-provider.tsx:26',
        message: 'createClient call in useState',
        data: { windowDefined: typeof window !== 'undefined' },
        timestamp: Date.now(),
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
    // #endregion
    return createClient();
  });

  useEffect(() => {
    // Récupérer l'utilisateur initial
    supabase.auth
      .getSession()
      .then((response: { data: { session: Session | null } | null }) => {
        const session = response.data?.session ?? null;
        setUser(session?.user ?? null);
        setLoading(false);
      });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
