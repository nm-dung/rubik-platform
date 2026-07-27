import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

/**
 * POST /api/lesson-review-history/create
 * Create a new review history entry
 */
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, lessonId } = body;

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: 'userId and lessonId are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('lesson_review_history')
      .insert({
        user_id: userId,
        lesson_id: lessonId,
        reviewed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating review history:', error);
      return NextResponse.json(
        { error: 'Failed to create review history' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in review history create API:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
