/**
 * Gestion des produits admin avec Supabase
 * Utilise marketplace_products en base de données
 */

import type { BioProduct } from '@/lib/types/marketplace';
import {
  getAllProducts as getAllProductsFromDB,
  getProductById as getProductByIdFromDB,
  createProduct as createProductInDB,
  updateProduct as updateProductInDB,
  deleteProduct as deleteProductInDB,
} from './marketplace-products-db';

/**
 * Récupère tous les produits (actifs et inactifs pour les admins)
 */
export async function getAllProducts(includeInactive = true): Promise<BioProduct[]> {
  return getAllProductsFromDB(includeInactive);
}

/**
 * Récupère un produit par ID
 */
export async function getProductById(id: string): Promise<BioProduct | null> {
  return getProductByIdFromDB(id);
}

/**
 * Met à jour un produit
 */
export async function updateProduct(
  id: string,
  updates: Partial<BioProduct>
): Promise<BioProduct | null> {
  return updateProductInDB(id, updates);
}

/**
 * Crée un nouveau produit
 */
export async function createProduct(
  product: Omit<BioProduct, 'id' | 'createdAt' | 'updatedAt'>
): Promise<BioProduct | null> {
  return createProductInDB(product);
}

/**
 * Duplique un produit
 */
export async function duplicateProduct(id: string): Promise<BioProduct | null> {
  const product = await getProductById(id);
  if (!product) return null;

  const duplicated: Omit<BioProduct, 'id' | 'createdAt' | 'updatedAt'> = {
    ...product,
    name: `${product.name} (Copy)`,
  };

  // Supprimer les champs qui seront générés
  delete (duplicated as any).id;
  delete (duplicated as any).createdAt;
  delete (duplicated as any).updatedAt;

  return createProductInDB(duplicated);
}

/**
 * Archive un produit (désactive)
 */
export async function archiveProduct(id: string): Promise<boolean> {
  const result = await updateProductInDB(id, { isActive: false });
  return result !== null;
}

/**
 * Supprime un produit
 */
export async function deleteProduct(id: string): Promise<boolean> {
  return deleteProductInDB(id);
}
