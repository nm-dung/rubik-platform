import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/algorithm-stats
 * Save algorithm practice session results
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { userId, results } = body;

    console.log('POST /api/algorithm-stats received:', { userId, results });

    if (!userId || !Array.isArray(results)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Save each result using the database function
    for (const result of results) {
      const { algorithm_id, time_ms } = result;
      console.log('Processing result:', { algorithm_id, time_ms });

      const { error } = await supabase.rpc('update_algorithm_practice_stats_simple', {
        p_user_id: userId,
        p_algorithm_id: algorithm_id,
        p_time_ms: time_ms
      });

      if (error) {
        console.error('Error updating algorithm stats:', error);
        return NextResponse.json({ error: 'Failed to save practice stats' }, { status: 500 });
      }
      
      console.log('Successfully saved result for algorithm:', algorithm_id);
    }

    console.log('All results saved successfully');
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in algorithm stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/algorithm-stats
 * Fetch algorithm practice stats for a user
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json([], { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const algorithmId = searchParams.get('algorithmId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('algorithm_practice_stats')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching algorithm stats:', error);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    if (!algorithmId) {
      return NextResponse.json(data || [], { status: 200 });
    }

    const { data: sessions, error: sessionsError } = await supabase
      .from('algorithm_practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('algorithm_id', algorithmId)
      .order('timestamp', { ascending: false });

    if (sessionsError) {
      console.error('Error fetching practice history:', sessionsError);
      return NextResponse.json({ error: 'Failed to fetch practice history' }, { status: 500 });
    }

    return NextResponse.json({
      stats: data?.find(stat => stat.algorithm_id === algorithmId) || null,
      sessions: sessions || [],
    }, { status: 200 });
  } catch (error) {
    console.error('Error in algorithm stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/algorithm-stats
 * Delete selected practice sessions, or all sessions for an algorithm.
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { userId, algorithmId, sessionIds, deleteAll } = body;

    if (!userId || !algorithmId || (!deleteAll && (!Array.isArray(sessionIds) || sessionIds.length === 0))) {
      return NextResponse.json({ error: 'Invalid delete request' }, { status: 400 });
    }

    let deleteQuery = supabase
      .from('algorithm_practice_sessions')
      .delete()
      .eq('user_id', userId)
      .eq('algorithm_id', algorithmId);

    if (!deleteAll) {
      deleteQuery = deleteQuery.in('id', sessionIds);
    }

    const { error: deleteError } = await deleteQuery;
    if (deleteError) {
      console.error('Error deleting practice history:', deleteError);
      return NextResponse.json({ error: 'Failed to delete practice history' }, { status: 500 });
    }

    const { data: remainingSessions, error: remainingError } = await supabase
      .from('algorithm_practice_sessions')
      .select('time_ms, timestamp')
      .eq('user_id', userId)
      .eq('algorithm_id', algorithmId)
      .order('timestamp', { ascending: false });

    if (remainingError) {
      console.error('Error rebuilding practice stats:', remainingError);
      return NextResponse.json({ error: 'Failed to rebuild practice stats' }, { status: 500 });
    }

    if (!remainingSessions || remainingSessions.length === 0) {
      const { error: statsDeleteError } = await supabase
        .from('algorithm_practice_stats')
        .delete()
        .eq('user_id', userId)
        .eq('algorithm_id', algorithmId);

      if (statsDeleteError) {
        console.error('Error deleting empty practice stats:', statsDeleteError);
        return NextResponse.json({ error: 'Failed to delete practice stats' }, { status: 500 });
      }

      return NextResponse.json({ stats: null }, { status: 200 });
    }

    const totalTime = remainingSessions.reduce((total, session) => total + session.time_ms, 0);
    const bestTime = Math.min(...remainingSessions.map(session => session.time_ms));
    const { data: updatedStats, error: statsUpdateError } = await supabase
      .from('algorithm_practice_stats')
      .update({
        practice_count: remainingSessions.length,
        total_time_ms: totalTime,
        best_time_ms: bestTime,
        avg_time_ms: totalTime / remainingSessions.length,
        last_practiced: remainingSessions[0].timestamp,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('algorithm_id', algorithmId)
      .select()
      .single();

    if (statsUpdateError) {
      console.error('Error updating practice stats:', statsUpdateError);
      return NextResponse.json({ error: 'Failed to update practice stats' }, { status: 500 });
    }

    return NextResponse.json({ stats: updatedStats }, { status: 200 });
  } catch (error) {
    console.error('Error deleting algorithm stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
