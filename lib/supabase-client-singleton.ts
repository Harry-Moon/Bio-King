/**
 * Singleton pour le client Supabase côté client
 * Évite les instances multiples de GoTrueClient
 * 
 * NOTE: Ce fichier n'est plus utilisé directement.
 * Utilisez plutôt lib/supabase.ts qui gère à la fois client et serveur.
 */

import { createBrowserClient } from '@supabase/ssr';

let supabaseBrowserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Obtient ou crée le client Supabase singleton pour le navigateur
 * @deprecated Utilisez plutôt lib/supabase.ts qui gère automatiquement client/serveur
 */
export function getSupabaseBrowserClient() {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseBrowserClient can only be used client-side');
  }

  if (!supabaseBrowserClient) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables'
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables'
      );
    }

    supabaseBrowserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  return supabaseBrowserClient;
}
