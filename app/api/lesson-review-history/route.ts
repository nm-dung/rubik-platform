import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

/**
 * GET /api/lesson-review-history
 * Fetch review history for a user and lesson
 * Query params:
 * - userId: string (required)
 * - lessonId: string (required)
 */
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json([], { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const lessonId = searchParams.get('lessonId');

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: 'userId and lessonId are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('lesson_review_history')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .order('reviewed_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching review history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch review history' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (err) {
    console.error('Unexpected error in review history API:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lesson-review-history
 * Delete review history entries
 * Query params:
 * - userId: string (required)
 * - lessonId: string (required)
 * - id?: string (optional, to delete specific entry. If not provided, deletes all for lesson)
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const lessonId = searchParams.get('lessonId');
    const id = searchParams.get('id');

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: 'userId and lessonId are required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('lesson_review_history')
      .delete()
      .eq('user_id', userId)
      .eq('lesson_id', lessonId);

    if (id) {
      query = query.eq('id', id);
    }

    const { error } = await query;

    if (error) {
      console.error('Supabase error deleting review history:', error);
      return NextResponse.json(
        { error: 'Failed to delete review history' },
        { status: 500 }
      );
    }

    // Update review_count in lesson_progress
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('review_count, last_reviewed')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    if (progressData) {
      const newReviewCount = id 
        ? Math.max(0, (progressData.review_count || 0) - 1)
        : 0;
      
      const updateData: any = { review_count: newReviewCount };
      if (newReviewCount === 0) {
        updateData.last_reviewed = null;
      }
      
      await supabase
        .from('lesson_progress')
        .update(updateData)
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in review history DELETE API:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
