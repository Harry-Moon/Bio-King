'use client';

import { useTranslation } from './use-translation';
import { normalizeThemeKey, THEME_KEYS } from '@/lib/types/learn';

/**
 * Hook pour les traductions Learn (thèmes, types, niveaux)
 */
export function useLearnTranslations() {
  const { t, language } = useTranslation();

  const getThemeLabel = (theme: string): string => {
    const key = normalizeThemeKey(theme);
    const translated = t(`learn.themes.${key}`);
    return translated !== `learn.themes.${key}` ? translated : theme;
  };

  const getContentTypeLabel = (type: string): string =>
    t(`learn.contentType.${type}`);

  const getLevelLabel = (level: string): string => t(`learn.level.${level}`);

  return {
    t,
    language,
    getThemeLabel,
    getContentTypeLabel,
    getLevelLabel,
    themeKeys: THEME_KEYS,
  };
}
