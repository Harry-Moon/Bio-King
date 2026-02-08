import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

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

// Client Supabase pour le client-side (avec RLS et cookies)
// Singleton pattern pour éviter les instances multiples de GoTrueClient
let supabaseBrowserInstance: ReturnType<typeof createBrowserClient> | null = null;
let supabaseServerInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side : créer une instance temporaire (pas de singleton nécessaire)
    if (!supabaseServerInstance) {
      supabaseServerInstance = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    return supabaseServerInstance;
  }

  // Client-side : utiliser le singleton browser
  if (!supabaseBrowserInstance) {
    supabaseBrowserInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return supabaseBrowserInstance;
}

// Export avec Proxy pour éviter l'exécution au niveau du module (lazy evaluation)
// Le Proxy délègue tous les accès à getSupabaseClient() qui est appelé seulement quand nécessaire
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof typeof client];
    // Si c'est une fonction, bind le contexte pour préserver 'this'
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

// Client Supabase avec service role pour server-side (bypass RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Noms des buckets Storage
export const STORAGE_BUCKETS = {
  SYSTEMAGE_REPORTS: 'systemage-reports',
  CATALOG_IMAGES: 'catalog-images',
  USER_AVATARS: 'user-avatars',
  PRODUCT_COVERS: 'product-covers',
} as const;
