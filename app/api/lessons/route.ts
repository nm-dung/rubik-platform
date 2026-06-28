import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/lessons
 * Fetch all lessons, optionally filtered by difficulty
 * 
 * Query params:
 * - difficulty?: 'beginner' | 'intermediate' | 'advanced'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');

    let query = supabase.from('lessons').select('*').order('difficulty').order('order');

    if (difficulty && ['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching lessons:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lessons' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (err) {
    console.error('Unexpected error in lessons API:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
