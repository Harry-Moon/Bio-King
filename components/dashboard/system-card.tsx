'use client';

import { cn } from '@/lib/utils';
import type { BodySystem } from '@/lib/types/systemage';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

interface SystemCardProps {
  system: BodySystem;
  chronologicalAge: number;
}

export function SystemCard({ system, chronologicalAge }: SystemCardProps) {
  const { t } = useTranslation();
  const ageDiff = system.ageDifference || 0;
  const systemAge = system.systemAge || 0;
  const agingSpeed = system.agingSpeed ?? null;

  // Déterminer la couleur et l'icône
  let colorClass = '';
  let bgClass = '';
  let icon = null;

  if (ageDiff < -5) {
    // Excellent - système plus jeune
    colorClass = 'text-green-500';
    bgClass = 'bg-green-500/10 border-green-500/20';
    icon = <TrendingDown className="h-4 w-4" />;
  } else if (ageDiff > 5) {
    // Attention - système plus vieux
    colorClass = 'text-red-500';
    bgClass = 'bg-red-500/10 border-red-500/20';
    icon = <TrendingUp className="h-4 w-4" />;
  } else {
    // Normal
    colorClass = 'text-amber-500';
    bgClass = 'bg-amber-500/10 border-amber-500/20';
    icon = <Minus className="h-4 w-4" />;
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border p-4 transition-all hover:shadow-lg',
        bgClass
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-sm font-medium leading-tight">
          {t(`systems.${system.systemName}`) || system.systemName}
        </h3>
        <div className={cn('flex items-center gap-1', colorClass)}>{icon}</div>
      </div>

      {/* Age */}
      <div className="mb-2">
        <div className={cn('text-2xl font-bold', colorClass)}>
          {systemAge.toFixed(1)}
        </div>
        <div className="text-xs text-muted-foreground">
          {t('dashboard.biologicalYears')}
        </div>
      </div>

      {/* Aging Speed */}
      <div className="mt-1 text-xs text-muted-foreground">
        {t('dashboard.agingSpeed')}:{' '}
        <span className={cn('font-medium', colorClass)}>
          {agingSpeed !== null ? `${agingSpeed.toFixed(2)}x` : '-'}
        </span>
      </div>

      {/* Difference */}
      <div
        className={cn(
          'mt-2 inline-flex items-center gap-1 text-xs font-medium',
          colorClass
        )}
      >
        {ageDiff > 0 ? '+' : ''}
        {ageDiff.toFixed(1)} {t('common.years')}
      </div>

      {/* Stage badge */}
      <div className="mt-3 inline-block rounded-full bg-background/50 px-2 py-1 text-xs">
        {t(`stages.${system.agingStage.toLowerCase()}`)}
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent to-background/5 opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
