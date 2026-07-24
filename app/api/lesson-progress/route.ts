import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { LessonProgress } from '@/lib/types';

/**
 * GET /api/lesson-progress
 * Fetch lesson progress for a user
 * Query params:
 * - userId: string (required)
 * - lessonId?: string (optional, to get progress for specific lesson)
 */
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json([], { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const lessonId = searchParams.get('lessonId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId);

    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching lesson progress:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lesson progress' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (err) {
    console.error('Unexpected error in lesson progress API:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lesson-progress
 * Create or update lesson progress
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
    const { userId, lessonId, completed, incrementReview } = body;

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: 'userId and lessonId are required' },
        { status: 400 }
      );
    }

    // Check if progress already exists
    const { data: existing } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    let result;

    if (existing) {
      // Update existing progress
      const updateData: Partial<LessonProgress> = {};
      
      if (typeof completed === 'boolean') {
        updateData.completed = completed;
        if (completed && !existing.completed) {
          updateData.completed_at = new Date().toISOString();
        }
      }
      
      if (incrementReview) {
        updateData.review_count = (existing.review_count || 0) + 1;
        updateData.last_reviewed = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('lesson_progress')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new progress
      const { data, error } = await supabase
        .from('lesson_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          completed: completed || false,
          completed_at: completed ? new Date().toISOString() : null,
          review_count: incrementReview ? 1 : 0,
          last_reviewed: incrementReview ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('Error in lesson progress POST API:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lesson-progress
 * Delete lesson progress
 * Query params:
 * - userId: string (required)
 * - lessonId: string (required)
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

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: 'userId and lessonId are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('lesson_progress')
      .delete()
      .eq('user_id', userId)
      .eq('lesson_id', lessonId);

    if (error) {
      console.error('Supabase error deleting lesson progress:', error);
      return NextResponse.json(
        { error: 'Failed to delete lesson progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in lesson progress DELETE API:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
