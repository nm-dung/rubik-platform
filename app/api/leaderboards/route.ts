import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/leaderboards
 * Fetch leaderboard data
 * Query params:
 * - type: 'overall' | 'algorithm' | 'category'
 * - algorithmId: string (for algorithm-specific)
 * - category: 'PLL' | 'OLL' | 'F2L' (for category-specific)
 * - limit: number (default 50)
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'overall';
    const algorithmId = searchParams.get('algorithmId');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('GET /api/leaderboards', { type, algorithmId, category, limit });

    let leaderboardData: any[] = [];

    if (type === 'overall') {
      // Overall leaderboard: total solves, best average
      const { data, error } = await supabase
        .from('algorithm_practice_stats')
        .select(`
          user_id,
          practice_count,
          avg_time_ms,
          best_time_ms,
          user_profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .order('practice_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Group by user and calculate aggregates
      const userMap = new Map();
      data.forEach((row: any) => {
        const userId = row.user_id;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            user_id: userId,
            username: row.user_profiles?.username || 'Anonymous',
            full_name: row.user_profiles?.full_name,
            avatar_url: row.user_profiles?.avatar_url,
            total_solves: 0,
            best_avg_time_ms: Infinity,
            best_single_time_ms: Infinity
          });
        }
        const user = userMap.get(userId);
        user.total_solves += row.practice_count;
        if (row.avg_time_ms && row.avg_time_ms < user.best_avg_time_ms) {
          user.best_avg_time_ms = row.avg_time_ms;
        }
        if (row.best_time_ms && row.best_time_ms < user.best_single_time_ms) {
          user.best_single_time_ms = row.best_time_ms;
        }
      });

      leaderboardData = Array.from(userMap.values())
        .filter(user => user.total_solves > 0)
        .sort((a, b) => b.total_solves - a.total_solves)
        .slice(0, limit);

    } else if (type === 'algorithm' && algorithmId) {
      // Algorithm-specific leaderboard
      const { data, error } = await supabase
        .from('algorithm_practice_stats')
        .select(`
          user_id,
          practice_count,
          avg_time_ms,
          best_time_ms,
          user_profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('algorithm_id', algorithmId)
        .order('best_time_ms', { ascending: true })
        .limit(limit);

      if (error) throw error;

      leaderboardData = data.map((row: any) => ({
        user_id: row.user_id,
        username: row.user_profiles?.username || 'Anonymous',
        full_name: row.user_profiles?.full_name,
        avatar_url: row.user_profiles?.avatar_url,
        practice_count: row.practice_count,
        avg_time_ms: row.avg_time_ms,
        best_time_ms: row.best_time_ms
      }));

    } else if (type === 'category' && category) {
      // Category-specific leaderboard
      const { data: algorithms } = await supabase
        .from('algorithms')
        .select('id')
        .eq('category', category);

      if (!algorithms || algorithms.length === 0) {
        return NextResponse.json({ error: 'No algorithms found for category' }, { status: 404 });
      }

      const algorithmIds = algorithms.map((a: any) => a.id);

      const { data, error } = await supabase
        .from('algorithm_practice_stats')
        .select(`
          user_id,
          algorithm_id,
          practice_count,
          avg_time_ms,
          best_time_ms,
          user_profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .in('algorithm_id', algorithmIds);

      if (error) throw error;

      // Group by user and calculate category aggregates
      const userMap = new Map();
      data.forEach((row: any) => {
        const userId = row.user_id;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            user_id: userId,
            username: row.user_profiles?.username || 'Anonymous',
            full_name: row.user_profiles?.full_name,
            avatar_url: row.user_profiles?.avatar_url,
            total_solves: 0,
            algorithms_learned: 0,
            best_avg_time_ms: Infinity,
            best_single_time_ms: Infinity
          });
        }
        const user = userMap.get(userId);
        user.total_solves += row.practice_count;
        user.algorithms_learned += 1;
        if (row.avg_time_ms && row.avg_time_ms < user.best_avg_time_ms) {
          user.best_avg_time_ms = row.avg_time_ms;
        }
        if (row.best_time_ms && row.best_time_ms < user.best_single_time_ms) {
          user.best_single_time_ms = row.best_time_ms;
        }
      });

      leaderboardData = Array.from(userMap.values())
        .filter(user => user.total_solves > 0)
        .sort((a, b) => b.total_solves - a.total_solves)
        .slice(0, limit);
    }

    return NextResponse.json({ data: leaderboardData, type });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}