/**
 * Gestion des articles Learn avec Supabase
 */

import { supabase } from '@/lib/supabase';
import type { LearnArticle } from '@/lib/types/learn';

/**
 * Convertit un article Supabase (snake_case) en LearnArticle (camelCase)
 */
function mapSupabaseArticle(data: Record<string, unknown>): LearnArticle {
  return {
    id: data.id as string,
    title: data.title as string,
    slug: data.slug as string,
    excerpt: data.excerpt as string,
    content: data.content as string | undefined,
    contentType:
      (data.content_type as LearnArticle['contentType']) || 'article',
    readingTimeMinutes: Number(data.reading_time_minutes) || 5,
    level: (data.level as LearnArticle['level']) || 'beginner',
    themes: Array.isArray(data.themes) ? (data.themes as string[]) : [],
    coverImage: data.cover_image as string | undefined,
    likesCount: Number(data.likes_count) || 0,
    savesCount: Number(data.saves_count) || 0,
    sharesCount: Number(data.shares_count) || 0,
    publishedAt: data.published_at
      ? new Date(data.published_at as string)
      : undefined,
    isActive: (data.is_active as boolean) ?? true,
    sortOrder: Number(data.sort_order) || 0,
    createdAt: new Date(data.created_at as string),
    updatedAt: new Date(data.updated_at as string),
  };
}

/**
 * Génère un slug à partir du titre
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Récupère tous les articles (actifs uniquement pour les non-admins)
 */
export async function getAllArticles(
  includeInactive = false
): Promise<LearnArticle[]> {
  let query = supabase.from('learn_articles').select('*');

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching learn articles:', error);
    return [];
  }

  return (data || []).map(mapSupabaseArticle);
}

/**
 * Récupère un article par ID
 */
export async function getArticleById(id: string): Promise<LearnArticle | null> {
  const { data, error } = await supabase
    .from('learn_articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return mapSupabaseArticle(data);
}

/**
 * Récupère un article par slug
 */
export async function getArticleBySlug(
  slug: string
): Promise<LearnArticle | null> {
  const { data, error } = await supabase
    .from('learn_articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching article by slug:', error);
    return null;
  }

  return mapSupabaseArticle(data);
}

/**
 * Crée un nouvel article (admin uniquement)
 */
export async function createArticle(
  article: Omit<LearnArticle, 'id' | 'createdAt' | 'updatedAt'>
): Promise<LearnArticle | null> {
  const slug =
    article.slug?.trim() || slugify(article.title) || `article-${Date.now()}`;

  const { data, error } = await supabase
    .from('learn_articles')
    .insert({
      title: article.title,
      slug,
      excerpt: article.excerpt,
      content: article.content || null,
      content_type: article.contentType || 'article',
      reading_time_minutes: article.readingTimeMinutes ?? 5,
      level: article.level || 'beginner',
      themes: article.themes || [],
      cover_image: article.coverImage || null,
      likes_count: article.likesCount ?? 0,
      saves_count: article.savesCount ?? 0,
      shares_count: article.sharesCount ?? 0,
      published_at: article.publishedAt?.toISOString() || null,
      is_active: article.isActive ?? true,
      sort_order: article.sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating article:', error);
    return null;
  }

  return mapSupabaseArticle(data);
}

/**
 * Met à jour un article (admin uniquement)
 */
export async function updateArticle(
  id: string,
  updates: Partial<LearnArticle>
): Promise<LearnArticle | null> {
  const updateData: Record<string, unknown> = {};

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.slug !== undefined) updateData.slug = updates.slug;
  if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt;
  if (updates.content !== undefined) updateData.content = updates.content;
  if (updates.contentType !== undefined)
    updateData.content_type = updates.contentType;
  if (updates.readingTimeMinutes !== undefined)
    updateData.reading_time_minutes = updates.readingTimeMinutes;
  if (updates.level !== undefined) updateData.level = updates.level;
  if (updates.themes !== undefined) updateData.themes = updates.themes;
  if (updates.coverImage !== undefined)
    updateData.cover_image = updates.coverImage;
  if (updates.likesCount !== undefined)
    updateData.likes_count = updates.likesCount;
  if (updates.savesCount !== undefined)
    updateData.saves_count = updates.savesCount;
  if (updates.sharesCount !== undefined)
    updateData.shares_count = updates.sharesCount;
  if (updates.publishedAt !== undefined)
    updateData.published_at = updates.publishedAt?.toISOString() ?? null;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
  if (updates.sortOrder !== undefined)
    updateData.sort_order = updates.sortOrder;

  const { data, error } = await supabase
    .from('learn_articles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating article:', error);
    return null;
  }

  return mapSupabaseArticle(data);
}

/**
 * Supprime un article (admin uniquement)
 */
export async function deleteArticle(id: string): Promise<boolean> {
  const { error } = await supabase.from('learn_articles').delete().eq('id', id);

  if (error) {
    console.error('Error deleting article:', error);
    return false;
  }

  return true;
}
