import { useState, useEffect, useCallback } from 'react';
import { Achievement } from '@/lib/types';
import { supabase } from '@/lib/supabase';
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
    if (!user || !supabase) {
      console.log('No user or supabase, skipping achievements fetch');
      setAchievements(emptyAchievements);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching achievements for user:', user.id);
      
      const { data, error } = await supabase
        .from('achievements')
        .select(`*, user_achievements (id, unlocked_at)`)
        .order('points', { ascending: false });

      if (error) {
        console.error('Error fetching achievements:', error);
        throw error;
      }

      console.log('Achievements data received:', data?.length || 0);

      const transformed = (data || []).map((achievement: {
        user_achievements?: Array<{ unlocked_at?: string | null }> | null;
        [key: string]: unknown;
      }) => ({
        ...achievement,
        isUnlocked: Boolean(achievement.user_achievements && achievement.user_achievements.length > 0),
        unlockedAt: achievement.user_achievements?.[0]?.unlocked_at || null
      }));

      console.log('Transformed achievements:', transformed.length, 'unlocked:', transformed.filter(a => a.isUnlocked).length);
      setAchievements(transformed as AchievementWithStatus[]);
      setError(null);
    } catch (err) {
      console.error('Error in fetchAchievements:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements');
      setAchievements(emptyAchievements);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const checkAchievements = async () => {
    try {
      if (!user || !supabase) {
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

      const { data: allAchievements, error: fetchError } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: false });

      if (fetchError) throw fetchError;

      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      if (userAchievementsError) throw userAchievementsError;

      const unlockedIds = new Set((userAchievements || []).map((ua: { achievement_id: string }) => ua.achievement_id));
      const newlyUnlocked: Array<Record<string, unknown>> = [];

      for (const achievement of allAchievements || []) {
        if (unlockedIds.has(achievement.id)) continue;

        let shouldUnlock = false;

        switch (achievement.requirement_type) {
          case 'lessons_completed':
            shouldUnlock = lessonsCompleted >= achievement.requirement_value;
            break;
          case 'algorithms_practiced':
            shouldUnlock = algorithmsPracticed >= achievement.requirement_value;
            break;
          case 'streak_days':
            shouldUnlock = currentStreak >= achievement.requirement_value;
            break;
          case 'avg_time':
            shouldUnlock = avgTimeMs > 0 && avgTimeMs <= achievement.requirement_value;
            break;
          case 'total_solves':
            shouldUnlock = totalSolves >= achievement.requirement_value;
            break;
        }

        if (shouldUnlock) {
          const { error: insertError } = await supabase
            .from('user_achievements')
            .insert({ user_id: user.id, achievement_id: achievement.id });

          if (!insertError) {
            newlyUnlocked.push({
              ...achievement,
              isUnlocked: true,
              unlockedAt: new Date().toISOString()
            });
          }
        }
      }

      const { data: updatedAchievements } = await supabase
        .from('achievements')
        .select(`*, user_achievements (id, unlocked_at)`)
        .order('points', { ascending: false });

      const transformed = (updatedAchievements || []).map((achievement: {
        user_achievements?: Array<{ unlocked_at?: string | null }> | null;
        [key: string]: unknown;
      }) => ({
        ...achievement,
        isUnlocked: Boolean(achievement.user_achievements && achievement.user_achievements.length > 0),
        unlockedAt: achievement.user_achievements?.[0]?.unlocked_at || null
      }));

      setAchievements(transformed as AchievementWithStatus[]);
      return newlyUnlocked;
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
