import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * Vérifie si un utilisateur est admin (basé sur le rôle en base de données)
 * @param user - L'utilisateur Supabase
 * @returns true si l'utilisateur est admin
 */
export async function isAdmin(user: User | null): Promise<boolean> {
  if (!user?.id) return false;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (error || !data) return false;
    return data.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Vérifie si un utilisateur est admin (version synchrone avec profil pré-chargé)
 * Utilisé quand le profil est déjà chargé (évite un appel API supplémentaire)
 * @param user - L'utilisateur Supabase
 * @param profile - Le profil utilisateur (optionnel, si déjà chargé)
 * @returns true si l'utilisateur est admin
 */
export function isAdminSync(
  user: User | null,
  profile?: { role?: string } | null
): boolean {
  if (!user?.id) return false;
  return profile?.role === 'admin';
}
