'use client';

import { supabase } from '@/lib/supabase';

/**
 * Client Supabase pour les composants client
 * Utilise automatiquement les cookies pour l'authentification
 * Réutilise le même singleton que lib/supabase.ts pour éviter les instances multiples
 */
export const createClient = () => {
  return supabase;
};
