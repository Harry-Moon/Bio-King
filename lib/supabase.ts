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
// Utilise createBrowserClient pour éviter les instances multiples
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export const supabase =
  typeof window !== 'undefined'
    ? (supabaseInstance ||
      (supabaseInstance = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )))
    : createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

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
} as const;
