import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/daily-challenge/archive
 * Get archive of previous daily challenges
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const requestedLimit = Number.parseInt(searchParams.get('limit') || '14', 10);
    const requestedOffset = Number.parseInt(searchParams.get('offset') || '0', 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 50) : 14;
    const offset = Number.isFinite(requestedOffset) ? Math.max(requestedOffset, 0) : 0;
    const difficulty = searchParams.get('difficulty');
    const before = searchParams.get('before');

    let query = supabase
      .from('daily_challenges')
      .select(`
        *,
        challenge_submissions(count)
      `)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (before && /^\d{4}-\d{2}-\d{2}$/.test(before)) {
      query = query.lt('date', before);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ challenges: data || [] });

  } catch (error) {
    console.error('Error fetching challenge archive:', error);
    return NextResponse.json({ error: 'Failed to fetch challenge archive' }, { status: 500 });
  }
}