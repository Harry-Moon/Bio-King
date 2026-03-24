'use client';

import { Target, Database, Flame, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileStatsProps {
  challengesCompleted: number;
  badgesUnlocked: number;
  reportsCount: number;
  currentStreak: number;
  className?: string;
}

const statConfig = [
  {
    key: 'challenges',
    label: 'Défis complétés',
    value: (p: ProfileStatsProps) => p.challengesCompleted,
    icon: Target,
    gradient: 'from-violet-500/20 to-purple-600/10',
    border: 'border-violet-500/30',
    iconColor: 'text-violet-500',
  },
  {
    key: 'badges',
    label: 'Badges obtenus',
    value: (p: ProfileStatsProps) => p.badgesUnlocked,
    icon: Award,
    gradient: 'from-amber-500/20 to-yellow-600/10',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-500',
  },
  {
    key: 'reports',
    label: 'Rapports ajoutés',
    value: (p: ProfileStatsProps) => p.reportsCount,
    icon: Database,
    gradient: 'from-emerald-500/20 to-teal-600/10',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-500',
  },
  {
    key: 'streak',
    label: 'Série actuelle',
    value: (p: ProfileStatsProps) => p.currentStreak,
    icon: Flame,
    gradient: 'from-orange-500/20 to-red-600/10',
    border: 'border-orange-500/30',
    iconColor: 'text-orange-500',
  },
];

export function ProfileStats(props: ProfileStatsProps) {
  return (
    <div
      className={cn(
        'grid gap-4 sm:grid-cols-2 lg:grid-cols-4',
        props.className
      )}
    >
      {statConfig.map(
        ({ key, label, value, icon: Icon, gradient, border, iconColor }) => (
          <div
            key={key}
            className={cn(
              'rounded-xl border bg-gradient-to-br p-5 transition-shadow hover:shadow-md',
              gradient,
              border
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg bg-background/80',
                  iconColor
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-2xl font-bold">{value(props)}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
