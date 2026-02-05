'use client';

import { Languages } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';

export function LanguageSelector({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Languages className="h-4 w-4 text-muted-foreground" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'fr')}
        className="rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
}
