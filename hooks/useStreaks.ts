import { useState, useEffect, useCallback } from 'react';
import { UserStreak } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const defaultStreak: UserStreak = {
  id: '',
  user_id: '',
  current_streak: 0,
  longest_streak: 0,
  last_activity_date: null,
  created_at: '',
  updated_at: ''
};

export function useStreaks() {
  const [streak, setStreak] = useState<UserStreak | null>(defaultStreak);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchStreak = useCallback(async () => {
    if (!user || !supabase) {
      setStreak(defaultStreak);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setStreak(
        data || {
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: null
        }
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch streak');
      setStreak(defaultStreak);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateStreak = async () => {
    try {
      if (!user || !supabase) {
        return null;
      }

      const { error } = await supabase.rpc('update_user_streak', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Failed to update streak, but continuing...');
        return null;
      }

      const { data } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setStreak(data || defaultStreak);
      return data || defaultStreak;
    } catch (err) {
      console.error('Error updating streak:', err);
      return null;
    }
  };

  useEffect(() => {
    if (!user) return;

    const timeoutId = setTimeout(() => {
      void fetchStreak();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchStreak, user]);

  return { streak, loading, error, refetch: fetchStreak, updateStreak };
}
