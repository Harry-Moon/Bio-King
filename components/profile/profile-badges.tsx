'use client';

import { BADGES } from '@/lib/data/badges';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileBadgesProps {
  unlockedBadgeIds: string[];
  maxDisplay?: number;
  showLocked?: boolean;
}

export function ProfileBadges({
  unlockedBadgeIds,
  maxDisplay = 12,
  showLocked = true,
}: ProfileBadgesProps) {
  const unlockedSet = new Set(unlockedBadgeIds);
  const displayedBadges = BADGES.slice(0, maxDisplay);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Badges
        </h3>
        <span className="text-sm font-medium">
          {unlockedBadgeIds.length} / {BADGES.length}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {displayedBadges.map((badge) => {
          const isUnlocked = unlockedSet.has(badge.id);
          const Icon = badge.icon;

          return (
            <div
              key={badge.id}
              className={cn(
                'group relative flex flex-col items-center rounded-xl p-3 transition-all',
                isUnlocked
                  ? 'bg-gradient-to-br from-card to-card/80 shadow-md ring-1 ring-border'
                  : 'bg-muted/50 opacity-60'
              )}
              title={isUnlocked ? badge.name : `${badge.name} (verrouillé)`}
            >
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110',
                  isUnlocked
                    ? `bg-gradient-to-br ${badge.color} text-white shadow-lg`
                    : 'bg-muted'
                )}
              >
                {isUnlocked ? (
                  <Icon className="h-6 w-6" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <p
                className={cn(
                  'mt-2 truncate text-center text-xs font-medium',
                  isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {badge.name}
              </p>
            </div>
          );
        })}
      </div>
      {showLocked && (
        <p className="text-xs text-muted-foreground">
          Accomplis des objectifs pour débloquer plus de badges.
        </p>
      )}
    </div>
  );
}
