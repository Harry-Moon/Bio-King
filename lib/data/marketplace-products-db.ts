/**
 * Gestion des produits marketplace avec Supabase
 * Remplace le mock store admin-products.ts
 */

import { supabase } from '@/lib/supabase';
import type { BioProduct } from '@/lib/types/marketplace';

/**
 * Convertit un produit Supabase (snake_case) en BioProduct (camelCase)
 */
function mapSupabaseProduct(data: any): BioProduct {
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    type: data.type,
    price: Number(data.price),
    currency: data.currency || 'EUR',
    description: data.description,
    detailedDescription: data.detailed_description || undefined,
    image: data.image,
    isHero: data.is_hero || false,
    displayType: (data.display_type as 'hero' | 'grid') || 'grid',
    billingModel: data.billing_model || 'one-time',
    badge: data.badge || undefined,
    featuredData: data.featured_data || undefined,
    tags: Array.isArray(data.tags) ? data.tags : [],
    primarySystem: data.primary_system || undefined,
    secondarySystems: data.secondary_systems || undefined,
    clinicalReferences: data.clinical_references || undefined,
    externalLink: data.external_link || undefined,
    isActive: data.is_active ?? true,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Récupère tous les produits (actifs uniquement pour les non-admins)
 */
export async function getAllProducts(
  includeInactive = false
): Promise<BioProduct[]> {
  let query = supabase.from('marketplace_products').select('*');

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return (data || []).map(mapSupabaseProduct);
}

/**
 * Récupère un produit par ID
 */
export async function getProductById(id: string): Promise<BioProduct | null> {
  const { data, error } = await supabase
    .from('marketplace_products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return mapSupabaseProduct(data);
}

/**
 * Crée un nouveau produit (admin uniquement)
 */
export async function createProduct(
  product: Omit<BioProduct, 'id' | 'createdAt' | 'updatedAt'>
): Promise<BioProduct | null> {
  const { data, error } = await supabase
    .from('marketplace_products')
    .insert({
      name: product.name,
      category: product.category,
      type: product.type,
      price: product.price,
      currency: product.currency || 'EUR',
      description: product.description,
      detailed_description: product.detailedDescription,
      image: product.image,
      is_hero: product.isHero || false,
      display_type: product.displayType || 'grid',
      billing_model: product.billingModel || 'one-time',
      badge: product.badge || null,
      featured_data: product.featuredData || null,
      tags: product.tags || [],
      primary_system: product.primarySystem || null,
      secondary_systems: product.secondarySystems || null,
      clinical_references: product.clinicalReferences || null,
      external_link: product.externalLink || null,
      is_active: product.isActive ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    return null;
  }

  return mapSupabaseProduct(data);
}

/**
 * Met à jour un produit (admin uniquement)
 */
export async function updateProduct(
  id: string,
  updates: Partial<BioProduct>
): Promise<BioProduct | null> {
  const updateData: any = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.price !== undefined) updateData.price = updates.price;
  if (updates.currency !== undefined) updateData.currency = updates.currency;
  if (updates.description !== undefined)
    updateData.description = updates.description;
  if (updates.detailedDescription !== undefined)
    updateData.detailed_description = updates.detailedDescription;
  if (updates.image !== undefined) updateData.image = updates.image;
  if (updates.isHero !== undefined) updateData.is_hero = updates.isHero;
  if (updates.displayType !== undefined)
    updateData.display_type = updates.displayType;
  if (updates.billingModel !== undefined)
    updateData.billing_model = updates.billingModel;
  if (updates.badge !== undefined) updateData.badge = updates.badge;
  if (updates.featuredData !== undefined)
    updateData.featured_data = updates.featuredData;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.primarySystem !== undefined)
    updateData.primary_system = updates.primarySystem;
  if (updates.secondarySystems !== undefined)
    updateData.secondary_systems = updates.secondarySystems;
  if (updates.clinicalReferences !== undefined)
    updateData.clinical_references = updates.clinicalReferences;
  if (updates.externalLink !== undefined)
    updateData.external_link = updates.externalLink;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('marketplace_products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    return null;
  }

  return mapSupabaseProduct(data);
}

/**
 * Supprime un produit (admin uniquement)
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('marketplace_products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }

  return true;
}
