import { useState, useEffect, useCallback } from 'react';
import { Achievement } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLessonProgressStore } from './useLessonProgressStore';
import { useCubeStore } from './useCubeStore';
import { useTimerStore } from './useTimerStore';
import { useStreaks } from './useStreaks';

interface AchievementWithStatus extends Achievement {
  isUnlocked: boolean;
  unlockedAt: string | null;
}

const emptyAchievements: AchievementWithStatus[] = [];

export function useAchievements() {
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>(emptyAchievements);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const completedLessonIds = useLessonProgressStore((state) => state.completedLessonIds);
  const learnedAlgs = useCubeStore((state) => state.learnedAlgs);
  const allSolves = useTimerStore((state) => state.solves);
  const { streak } = useStreaks();

  const fetchAchievements = useCallback(async () => {
    if (!user) {
      setAchievements(emptyAchievements);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/achievements');
      if (!response.ok) {
        console.error('Failed to fetch achievements, using empty array');
        setAchievements(emptyAchievements);
        return;
      }
      const data = await response.json();
      setAchievements(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements');
      setAchievements(emptyAchievements);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const checkAchievements = async () => {
    try {
      if (!user) {
        return [];
      }

      // Calculate user stats from frontend stores
      const lessonsCompleted = completedLessonIds.length;
      const algorithmsPracticed = learnedAlgs.length;
      const currentStreak = streak?.current_streak || 0;
      const totalSolves = allSolves.length;
      
      // Calculate average time
      const validTimes = allSolves
        .filter(s => s.penalty !== 'DNF')
        .map(s => s.penalty === '+2' ? s.time + 2000 : s.time);
      const avgTimeMs = validTimes.length > 0 
        ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length 
        : 0;

      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonsCompleted,
          algorithmsPracticed,
          currentStreak,
          avgTimeMs,
          totalSolves
        })
      });

      if (!response.ok) {
        console.error('Failed to check achievements, but continuing...');
        return [];
      }
      const data = await response.json();
      setAchievements(data.achievements);
      return data.newlyUnlocked || [];
    } catch (err) {
      console.error('Error checking achievements:', err);
      return [];
    }
  };

  useEffect(() => {
    if (!user) return;

    const timeoutId = setTimeout(() => {
      void fetchAchievements();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchAchievements, user]);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalPoints = achievements
    .filter(a => a.isUnlocked)
    .reduce((sum, a) => sum + a.points, 0);

  return { 
    achievements, 
    loading, 
    error, 
    refetch: fetchAchievements, 
    checkAchievements,
    unlockedCount,
    totalPoints
  };
}
