'use client';

import { useLanguage } from './language-context';
import { translations } from './translations';

/**
 * Hook pour accéder aux traductions
 */
export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Retourne la clé si non trouvée
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, language };
}
