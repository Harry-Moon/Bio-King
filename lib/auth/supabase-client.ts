'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Client Supabase pour les composants client
 * Utilise automatiquement les cookies pour l'authentification
 */
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
