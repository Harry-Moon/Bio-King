/**
 * Types pour l'espace d'apprentissage Learn
 */

export type ArticleContentType = 'article' | 'protocol' | 'clinical_study';

export type ArticleLevel = 'beginner' | 'intermediate' | 'advanced';

export interface LearnArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  contentType: ArticleContentType;
  readingTimeMinutes: number;
  level: ArticleLevel;
  themes: string[];
  coverImage?: string;
  likesCount: number;
  savesCount: number;
  sharesCount: number;
  publishedAt?: Date;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export const ARTICLE_CONTENT_TYPE_LABELS: Record<ArticleContentType, string> = {
  article: 'Article',
  protocol: 'Protocole officiel',
  clinical_study: 'Étude clinique',
};

export const ARTICLE_LEVEL_LABELS: Record<ArticleLevel, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

/** Clés canoniques des thématiques (stockées en DB, traduites via i18n) */
export const THEME_KEYS = [
  'energy',
  'longevity',
  'inflammation',
  'nutrition',
  'sleep',
  'brain',
  'metabolism',
  'epigenetics',
  'tech',
  'hormesis',
  'recovery',
] as const;

export type ThemeKey = (typeof THEME_KEYS)[number];

/** Mapping FR -> clé (rétrocompatibilité avec articles existants) */
export const THEME_FR_TO_KEY: Record<string, ThemeKey> = {
  Energie: 'energy',
  Longévité: 'longevity',
  Inflammation: 'inflammation',
  Nutrition: 'nutrition',
  Sommeil: 'sleep',
  Cerveau: 'brain',
  Metabolisme: 'metabolism',
  Epigénétique: 'epigenetics',
  Tech: 'tech',
  Hormèse: 'hormesis',
  Récupération: 'recovery',
};

/** Normalise une valeur thème (FR ou clé) en clé canonique */
export function normalizeThemeKey(theme: string): string {
  if (THEME_KEYS.includes(theme as ThemeKey)) return theme;
  return THEME_FR_TO_KEY[theme] || theme;
}

/** @deprecated Utiliser THEME_KEYS - conservé pour compatibilité */
export const DEFAULT_THEMES = THEME_KEYS;
