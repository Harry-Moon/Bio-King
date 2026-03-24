'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';

export interface ProfileStats {
  reportsCount: number;
  challengesCompleted: number;
  badgesUnlocked: number;
  currentStreak: number;
  /** Mock for now - would need user_achievements table */
  unlockedBadgeIds: string[];
}

/**
 * Fetches gamification stats for the current user.
 * Reports count comes from systemage_reports; badges/challenges are mocked until DB tables exist.
 */
export function useProfileStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({
    reportsCount: 0,
    challengesCompleted: 0,
    badgesUnlocked: 0,
    currentStreak: 0,
    unlockedBadgeIds: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setStats({
        reportsCount: 0,
        challengesCompleted: 0,
        badgesUnlocked: 0,
        currentStreak: 0,
        unlockedBadgeIds: [],
      });
      setLoading(false);
      return;
    }

    async function loadStats() {
      if (!user?.id) return;
      try {
        const { count, error } = await supabase
          .from('systemage_reports')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (error) throw error;

        const reportsCount = count ?? 0;

        // Derive badges from current data (can be replaced by user_achievements table later)
        const unlockedBadgeIds: string[] = [];
        if (reportsCount >= 1) unlockedBadgeIds.push('first-upload');
        if (reportsCount >= 3) unlockedBadgeIds.push('three-reports');
        if (reportsCount >= 10) unlockedBadgeIds.push('ten-reports');

        setStats({
          reportsCount,
          challengesCompleted: 0, // TODO: challenges table
          badgesUnlocked: unlockedBadgeIds.length,
          currentStreak: 0, // TODO: streak tracking
          unlockedBadgeIds,
        });
      } catch (err) {
        console.error('Error loading profile stats:', err);
        setStats({
          reportsCount: 0,
          challengesCompleted: 0,
          badgesUnlocked: 0,
          currentStreak: 0,
          unlockedBadgeIds: [],
        });
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user?.id]);

  return { stats, loading };
}
