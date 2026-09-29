import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSupabase } from '@/lib/api-auth';

/**
 * GET /api/daily-challenge/streaks
 * Get user's challenge streak information
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSupabase(request);
    if (!auth.client || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data, error } = await auth.client
      .from('daily_challenge_streaks')
      .select('*')
      .eq('user_id', auth.user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // No streak record exists yet
      return NextResponse.json({ 
        streak: {
          current_streak: 0,
          longest_streak: 0,
          total_challenges_completed: 0,
          last_participation_date: null
        }
      });
    }

    if (error) throw error;

    return NextResponse.json({ streak: data });

  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 });
  }
}