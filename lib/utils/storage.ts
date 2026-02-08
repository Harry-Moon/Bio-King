/**
 * Utilitaires pour l'upload de fichiers vers Supabase Storage
 */

import { supabase, supabaseAdmin, STORAGE_BUCKETS } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Upload un avatar utilisateur
 * @param userId - ID de l'utilisateur
 * @param file - Fichier image (File ou Blob)
 * @param filename - Nom du fichier (optionnel, par défaut 'avatar.{ext}')
 * @returns URL publique de l'avatar uploadé
 */
export async function uploadUserAvatar(
  userId: string,
  file: File | Blob,
  filename?: string
): Promise<string> {
  // Générer le nom de fichier si non fourni
  const fileExtension = file instanceof File 
    ? file.name.split('.').pop() || 'jpg'
    : 'jpg';
  const avatarFilename = filename || `avatar.${fileExtension}`;
  const filePath = `${userId}/${avatarFilename}`;

  // Convertir en ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Uploader vers Supabase Storage
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.USER_AVATARS)
    .upload(filePath, buffer, {
      contentType: file instanceof File ? file.type : 'image/jpeg',
      upsert: true, // Remplacer l'avatar existant
    });

  if (error) {
    throw new Error(`Failed to upload avatar: ${error.message}`);
  }

  // Obtenir l'URL publique
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.USER_AVATARS)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Supprime l'avatar d'un utilisateur
 * @param userId - ID de l'utilisateur
 * @param filename - Nom du fichier (optionnel, par défaut 'avatar.*')
 */
export async function deleteUserAvatar(
  userId: string,
  filename?: string
): Promise<void> {
  const filePath = filename 
    ? `${userId}/${filename}`
    : `${userId}/avatar.jpg`; // Par défaut, supprimer avatar.jpg

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.USER_AVATARS)
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete avatar: ${error.message}`);
  }
}

/**
 * Obtient l'URL publique de l'avatar d'un utilisateur
 * @param userId - ID de l'utilisateur
 * @param filename - Nom du fichier (optionnel, par défaut 'avatar.jpg')
 * @returns URL publique de l'avatar ou null si non trouvé
 */
export function getUserAvatarUrl(
  userId: string,
  filename: string = 'avatar.jpg'
): string {
  const filePath = `${userId}/${filename}`;
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.USER_AVATARS)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * Upload une image de couverture pour un produit (admin uniquement)
 * @param productId - ID du produit
 * @param file - Fichier image (File ou Blob)
 * @param filename - Nom du fichier (optionnel, par défaut 'cover.{ext}')
 * @returns URL publique de l'image uploadée
 */
export async function uploadProductCover(
  productId: string,
  file: File | Blob,
  filename?: string
): Promise<string> {
  // Générer le nom de fichier si non fourni
  const fileExtension = file instanceof File 
    ? file.name.split('.').pop() || 'jpg'
    : 'jpg';
  const coverFilename = filename || `cover.${fileExtension}`;
  const filePath = `${productId}/${coverFilename}`;

  // Convertir en ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Uploader vers Supabase Storage (utilise supabaseAdmin pour bypass RLS côté serveur)
  // Note: Cette fonction doit être appelée depuis une route API avec vérification admin
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKETS.PRODUCT_COVERS)
    .upload(filePath, buffer, {
      contentType: file instanceof File ? file.type : 'image/jpeg',
      upsert: true, // Remplacer l'image existante
    });

  if (error) {
    throw new Error(`Failed to upload product cover: ${error.message}`);
  }

  // Obtenir l'URL publique
  const { data: urlData } = supabaseAdmin.storage
    .from(STORAGE_BUCKETS.PRODUCT_COVERS)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Obtient l'URL publique de l'image de couverture d'un produit
 * @param productId - ID du produit
 * @param filename - Nom du fichier (optionnel, par défaut 'cover.jpg')
 * @returns URL publique de l'image
 */
export function getProductCoverUrl(
  productId: string,
  filename: string = 'cover.jpg'
): string {
  const filePath = `${productId}/${filename}`;
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.PRODUCT_COVERS)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * Supprime l'image de couverture d'un produit (admin uniquement)
 * @param productId - ID du produit
 * @param filename - Nom du fichier (optionnel, par défaut 'cover.*')
 */
export async function deleteProductCover(
  productId: string,
  filename?: string
): Promise<void> {
  const filePath = filename 
    ? `${productId}/${filename}`
    : `${productId}/cover.jpg`; // Par défaut, supprimer cover.jpg

  // Utilise supabaseAdmin pour bypass RLS côté serveur
  // Note: Cette fonction doit être appelée depuis une route API avec vérification admin
  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKETS.PRODUCT_COVERS)
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete product cover: ${error.message}`);
  }
}

/**
 * Valide qu'un fichier est une image valide
 * @param file - Fichier à valider
 * @param maxSizeMB - Taille maximale en MB (défaut: 5MB pour avatars, 10MB pour produits)
 * @returns true si valide, false sinon
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  // Vérifier le type MIME
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`,
    };
  }

  // Vérifier la taille
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Taille maximale: ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}
