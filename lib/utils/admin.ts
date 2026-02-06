import type { User } from '@supabase/supabase-js';

/**
 * Liste des emails admin autorisés
 */
const ADMIN_EMAILS = ['harry@citizenvitae.com'];

/**
 * Vérifie si un utilisateur est admin
 */
export function isAdmin(user: User | null): boolean {
  if (!user?.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}
