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

  // Créer le client uniquement côté client (lazy initialization)
  const [supabase] = useState(() => createClient());

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
