'use client';

import { Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ProfileLevelProps {
  /** Current XP (derived from reports, badges, etc.) */
  xp: number;
  /** XP needed for next level */
  xpToNextLevel: number;
  /** Current level (1-based) */
  level: number;
  className?: string;
}

const XP_PER_LEVEL = 100;

export function ProfileLevel({
  xp,
  xpToNextLevel,
  level,
  className,
}: ProfileLevelProps) {
  const progress = Math.min(100, (xp / xpToNextLevel) * 100);

  return (
    <div
      className={cn(
        'rounded-xl border bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent p-5',
        'border-amber-500/20',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-lg">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Niveau</p>
            <p className="text-2xl font-bold">Niveau {level}</p>
          </div>
        </div>
        <Link
          href="/challenges"
          className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400"
        >
          Défis
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-muted-foreground">{xp} XP</span>
          <span className="text-muted-foreground">
            {xpToNextLevel} XP pour niveau {level + 1}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
