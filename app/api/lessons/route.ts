import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/lessons
 * Fetch all lessons, optionally filtered by learning_path, difficulty, or search
 *
 * Query params:
 * - learning_path?: 'beginner' | 'advanced' | 'both'
 * - difficulty?: 'beginner' | 'intermediate' | 'advanced'
 * - search?: string - search in title_en, title_vi, description_en, description_vi
 */
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json([], { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const learningPath = searchParams.get('learning_path');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');

    let query = supabase.from('lessons').select('*').order('difficulty').order('order');

    if (learningPath && ['beginner', 'advanced', 'both'].includes(learningPath)) {
      query = query.eq('learning_path', learningPath);
    }

    if (difficulty && ['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      query = query.eq('difficulty', difficulty);
    }

    if (search) {
      query = query.or(`title_en.ilike.%${search}%,title_vi.ilike.%${search}%,description_en.ilike.%${search}%,description_vi.ilike.%${search}%`);
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
