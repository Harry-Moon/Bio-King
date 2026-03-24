'use client';

import { GraduationCap, Layers, Zap } from 'lucide-react';
import type { ArticleLevel } from '@/lib/types/learn';
import { useLearnTranslations } from '@/lib/i18n/use-learn-translations';
import { cn } from '@/lib/utils';

/** Configuration icône + couleur par niveau (exporté pour réutilisation) */
export const LEVEL_CONFIG: Record<
  ArticleLevel,
  { icon: typeof GraduationCap; iconClassName: string; badgeClassName: string }
> = {
  beginner: {
    icon: GraduationCap,
    iconClassName: 'text-green-500',
    badgeClassName:
      'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
  },
  intermediate: {
    icon: Layers,
    iconClassName: 'text-amber-500',
    badgeClassName:
      'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  advanced: {
    icon: Zap,
    iconClassName: 'text-violet-500',
    badgeClassName:
      'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
  },
};

interface LevelBadgeProps {
  level: ArticleLevel;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

/**
 * Badge de niveau avec icône et couleur pour les articles Learn
 */
export function LevelBadge({
  level,
  size = 'sm',
  showLabel = true,
  className,
}: LevelBadgeProps) {
  const { getLevelLabel } = useLearnTranslations();
  const config = LEVEL_CONFIG[level];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-medium',
        config.badgeClassName,
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm',
        className
      )}
    >
      <Icon
        className={cn(
          size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
          config.iconClassName
        )}
      />
      {showLabel && getLevelLabel(level)}
    </span>
  );
}
