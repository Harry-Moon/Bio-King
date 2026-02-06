/**
 * Gestion d'état mock pour les produits admin
 * TODO: Migrer vers Supabase
 */

import type { BioProduct } from '@/lib/types/marketplace';
import { mockProducts } from './marketplace-products';

// État global des produits (simule une base de données)
let productsState: BioProduct[] = [...mockProducts];

/**
 * Récupère tous les produits
 */
export function getAllProducts(): BioProduct[] {
  return productsState;
}

/**
 * Récupère un produit par ID
 */
export function getProductById(id: string): BioProduct | undefined {
  return productsState.find((p) => p.id === id);
}

/**
 * Met à jour un produit
 */
export function updateProduct(
  id: string,
  updates: Partial<BioProduct>
): BioProduct | null {
  const index = productsState.findIndex((p) => p.id === id);
  if (index === -1) return null;

  productsState[index] = {
    ...productsState[index],
    ...updates,
    updatedAt: new Date(),
  };

  return productsState[index];
}

/**
 * Crée un nouveau produit
 */
export function createProduct(
  product: Omit<BioProduct, 'id' | 'createdAt' | 'updatedAt'>
): BioProduct {
  const newProduct: BioProduct = {
    ...product,
    id: `product-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  productsState.push(newProduct);
  return newProduct;
}

/**
 * Duplique un produit
 */
export function duplicateProduct(id: string): BioProduct | null {
  const product = getProductById(id);
  if (!product) return null;

  const duplicated: BioProduct = {
    ...product,
    id: `product-${Date.now()}`,
    name: `${product.name} (Copy)`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  productsState.push(duplicated);
  return duplicated;
}

/**
 * Archive un produit (désactive)
 */
export function archiveProduct(id: string): boolean {
  const product = getProductById(id);
  if (!product) return false;

  updateProduct(id, { isActive: false });
  return true;
}

/**
 * Supprime un produit
 */
export function deleteProduct(id: string): boolean {
  const index = productsState.findIndex((p) => p.id === id);
  if (index === -1) return false;

  productsState.splice(index, 1);
  return true;
}
