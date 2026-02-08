'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './auth-provider';

interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'admin' | 'moderator';
  avatar_url: string | null;
  chronological_age: number | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        if (!user?.id) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select(
            'id, email, first_name, last_name, role, avatar_url, chronological_age'
          )
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          setProfile(null);
        } else {
          setProfile(data as Profile);
        }
      } catch (err) {
        console.error('Error:', err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  return { profile, loading };
}
