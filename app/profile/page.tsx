'use client';

import { useProfile } from '@/components/auth/use-profile';
import { useProfileStats } from '@/lib/hooks/use-profile-stats';
import { ProfileBadges } from '@/components/profile/profile-badges';
import { ProfileStats } from '@/components/profile/profile-stats';
import { ProfileLevel } from '@/components/profile/profile-level';
import { Loader2, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function formatMemberSince(createdAt: string | undefined): string {
  if (!createdAt) return '—';
  const date = new Date(createdAt);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

export default function ProfilePage() {
  const { profile, loading: profileLoading } = useProfile();
  const { stats, loading: statsLoading } = useProfileStats();

  const loading = profileLoading || statsLoading;

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  const displayName =
    profile?.first_name || profile?.last_name
      ? [profile.first_name, profile.last_name].filter(Boolean).join(' ')
      : 'Non configuré';

  const xp =
    stats.reportsCount * 25 +
    stats.badgesUnlocked * 50 +
    stats.challengesCompleted * 30;
  const xpPerLevel = 100;
  const level = Math.floor(xp / xpPerLevel) + 1;
  const xpInCurrentLevel = xp % xpPerLevel;
  const xpToNextLevel = xpPerLevel;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Profil</h1>

      {/* Profile header with avatar and info */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex-shrink-0">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={displayName}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full border-4 border-primary/10 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                <User className="h-12 w-12 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <p className="text-muted-foreground">
                {profile?.email ?? 'Email non configuré'}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Membre depuis{' '}
                  {formatMemberSince(profile?.created_at ?? undefined)}
                </span>
              </div>
            </div>
            <Link
              href="/settings"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              Modifier le profil
            </Link>
          </div>
        </div>
      </div>

      {/* Level & XP progress */}
      <ProfileLevel
        xp={xpInCurrentLevel}
        xpToNextLevel={xpToNextLevel}
        level={level}
      />

      {/* Gamified stats */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Statistiques</h2>
        <ProfileStats
          challengesCompleted={stats.challengesCompleted}
          badgesUnlocked={stats.badgesUnlocked}
          reportsCount={stats.reportsCount}
          currentStreak={stats.currentStreak}
        />
      </div>

      {/* Badges section */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Badges & Récompenses</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Débloquez des badges en accomplissant des objectifs et en relevant
              des défis.
            </p>
          </div>
          <Link
            href="/badges"
            className="text-sm font-medium text-primary hover:underline"
          >
            Voir toute la collection
          </Link>
        </div>
        <ProfileBadges
          unlockedBadgeIds={stats.unlockedBadgeIds}
          maxDisplay={12}
          showLocked
        />
      </div>
    </div>
  );
}
