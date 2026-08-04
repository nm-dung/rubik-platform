import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const defaultAchievements = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name_en: 'First Steps',
    name_vi: 'Bước đầu tiên',
    description_en: 'Complete your first lesson',
    description_vi: 'Hoàn thành bài học đầu tiên',
    icon: '🎯',
    requirement_type: 'lessons_completed',
    requirement_value: 1,
    points: 10
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name_en: 'Quick Learner',
    name_vi: 'Học nhanh',
    description_en: 'Complete 5 lessons',
    description_vi: 'Hoàn thành 5 bài học',
    icon: '📚',
    requirement_type: 'lessons_completed',
    requirement_value: 5,
    points: 25
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name_en: 'Dedicated Student',
    name_vi: 'Học viên tận tâm',
    description_en: 'Complete 10 lessons',
    description_vi: 'Hoàn thành 10 bài học',
    icon: '🎓',
    requirement_type: 'lessons_completed',
    requirement_value: 10,
    points: 50
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name_en: 'Algorithm Beginner',
    name_vi: 'Người mới thuật toán',
    description_en: 'Practice 10 algorithms',
    description_vi: 'Luyện 10 thuật toán',
    icon: '🧩',
    requirement_type: 'algorithms_practiced',
    requirement_value: 10,
    points: 25
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name_en: 'Algorithm Master',
    name_vi: 'Bậc thầy thuật toán',
    description_en: 'Practice 50 algorithms',
    description_vi: 'Luyện 50 thuật toán',
    icon: '🏆',
    requirement_type: 'algorithms_practiced',
    requirement_value: 50,
    points: 100
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    name_en: '3-Day Streak',
    name_vi: 'Chuỗi 3 ngày',
    description_en: 'Maintain a 3-day activity streak',
    description_vi: 'Duy trì chuỗi hoạt động 3 ngày',
    icon: '🔥',
    requirement_type: 'streak_days',
    requirement_value: 3,
    points: 15
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    name_en: '7-Day Streak',
    name_vi: 'Chuỗi 7 ngày',
    description_en: 'Maintain a 7-day activity streak',
    description_vi: 'Duy trì chuỗi hoạt động 7 ngày',
    icon: '⚡',
    requirement_type: 'streak_days',
    requirement_value: 7,
    points: 35
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    name_en: '30-Day Streak',
    name_vi: 'Chuỗi 30 ngày',
    description_en: 'Maintain a 30-day activity streak',
    description_vi: 'Duy trì chuỗi hoạt động 30 ngày',
    icon: '💎',
    requirement_type: 'streak_days',
    requirement_value: 30,
    points: 100
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    name_en: 'Speed Demon',
    name_vi: 'Tốc độ',
    description_en: 'Achieve an average time under 5 seconds',
    description_vi: 'Đạt thời gian trung bình dưới 5 giây',
    icon: '⚡',
    requirement_type: 'avg_time',
    requirement_value: 5000,
    points: 50
  },
  {
    id: '00000000-0000-0000-0000-000000000010',
    name_en: 'Century Club',
    name_vi: 'Câu lạc bộ trăm',
    description_en: 'Complete 100 total solves',
    description_vi: 'Hoàn thành 100 lần giải tổng cộng',
    icon: '💯',
    requirement_type: 'total_solves',
    requirement_value: 100,
    points: 75
  }
] as const;

const fallbackAchievements = defaultAchievements.map((achievement) => ({
  ...achievement,
  created_at: new Date().toISOString(),
  isUnlocked: false,
  unlockedAt: null
}));

async function ensureDefaultAchievements(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: existingAchievements, error: fetchError } = await supabase
    .from('achievements')
    .select('id');

  if (fetchError) {
    if (String(fetchError.message).includes('does not exist')) {
      return;
    }
    throw fetchError;
  }

  if ((existingAchievements || []).length > 0) {
    return;
  }

  const { error: insertError } = await supabase
    .from('achievements')
    .insert(defaultAchievements);

  if (insertError) {
    throw insertError;
  }
}

export async function GET(request: Request) {
  void request;
  try {
    const supabase = await createServerSupabaseClient();

    // Get user from session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json([]);
    }

    await ensureDefaultAchievements(supabase);
    
    // Fetch all achievements with user's unlock status
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select(`
        *,
        user_achievements (
          id,
          unlocked_at
        )
      `)
      .order('points', { ascending: false });

    if (error) throw error;

    // Transform data to include unlock status
    const achievementsWithStatus = (achievements && achievements.length > 0 ? achievements : fallbackAchievements).map((achievement: {
      user_achievements?: Array<{ unlocked_at?: string | null }> | null;
      isUnlocked?: boolean;
      unlockedAt?: string | null;
      [key: string]: unknown;
    }) => ({
      ...achievement,
      isUnlocked: achievement.isUnlocked ?? Boolean(achievement.user_achievements && achievement.user_achievements.length > 0),
      unlockedAt: achievement.unlockedAt ?? achievement.user_achievements?.[0]?.unlocked_at ?? null
    }));

    return NextResponse.json(achievementsWithStatus);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  void request;
  try {
    const supabase = await createServerSupabaseClient();

    // Get user from session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({
        achievements: [],
        newlyUnlocked: []
      });
    }

    await ensureDefaultAchievements(supabase);
    
    // Get user stats from request body
    const body = await request.json();
    const { lessonsCompleted, algorithmsPracticed, currentStreak, avgTimeMs, totalSolves } = body;
    
    // Fetch all achievements that user hasn't unlocked yet
    const { data: achievements, error: fetchError } = await supabase
      .from('achievements')
      .select('*')
      .order('points', { ascending: false });

    if (fetchError) throw fetchError;

    // Get user's already unlocked achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);

    if (userAchievementsError) throw userAchievementsError;

    const unlockedIds = new Set((userAchievements || []).map((ua: { achievement_id: string }) => ua.achievement_id));
    const newlyUnlocked: Array<Record<string, unknown>> = [];

    // Check each achievement
    for (const achievement of achievements) {
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
        // Unlock the achievement
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievement.id
          });

        if (!insertError) {
          newlyUnlocked.push({
            ...achievement,
            isUnlocked: true,
            unlockedAt: new Date().toISOString()
          });
        }
      }
    }

    // Fetch updated achievements with unlock status
    const { data: updatedAchievements } = await supabase
      .from('achievements')
      .select(`
        *,
        user_achievements (
          id,
          unlocked_at
        )
      `)
      .order('points', { ascending: false });

    const achievementsWithStatus = (updatedAchievements || []).map((achievement: {
      user_achievements?: Array<{ unlocked_at?: string | null }> | null;
      [key: string]: unknown;
    }) => ({
      ...achievement,
      isUnlocked: Boolean(achievement.user_achievements && achievement.user_achievements.length > 0),
      unlockedAt: achievement.user_achievements?.[0]?.unlocked_at || null
    }));

    return NextResponse.json({
      achievements: achievementsWithStatus,
      newlyUnlocked
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    );
  }
}
