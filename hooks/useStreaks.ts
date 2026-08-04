import { useState, useEffect, useCallback } from 'react';
import { UserStreak } from '@/lib/types';
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
    if (!user) {
      setStreak(defaultStreak);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/streaks');
      if (!response.ok) {
        setStreak(defaultStreak);
        return;
      }
      const data = await response.json();
      setStreak(data);
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
      if (!user) {
        return null;
      }

      const response = await fetch('/api/streaks', { method: 'POST' });
      if (!response.ok) {
        console.error('Failed to update streak, but continuing...');
        return null;
      }
      const data = await response.json();
      setStreak(data);
      return data;
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
