import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedSupabase } from '@/lib/api-auth';

/**
 * GET /api/daily-challenge/submissions
 * Get submissions for a specific challenge
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const challengeId = searchParams.get('challengeId');
    const userId = searchParams.get('userId');
    const requestedLimit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;

    let query = supabase
      .from('challenge_submissions')
      .select('*')
      .order('time_ms', { ascending: true })
      .limit(limit);

    if (challengeId) {
      query = query.eq('challenge_id', challengeId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: submissions, error } = await query;

    if (error) throw error;

    const userIds = [...new Set((submissions || []).map((submission) => submission.user_id))];
    const { data: profiles, error: profilesError } = userIds.length
      ? await supabaseAdmin
        .from('user_profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds)
      : { data: [], error: null };

    if (profilesError) console.error('Error fetching challenge participant profiles:', profilesError);
    const profilesById = new Map((profiles || []).map((profile) => [profile.id, profile]));
    const results = (submissions || []).map((submission) => ({
      ...submission,
      user_profiles: profilesById.get(submission.user_id) || null,
    }));

    return NextResponse.json({ submissions: results });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

/**
 * POST /api/daily-challenge/submissions
 * Submit a time for a daily challenge
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSupabase(request);
    if (!auth.client || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { challengeId, timeMs, solution, videoUrl, videoPlatform, notes } = body;
    if (typeof challengeId !== 'string' || !challengeId || !Number.isInteger(timeMs) || timeMs <= 0 || timeMs > 3600000) {
      return NextResponse.json({ error: 'A valid challenge and time are required' }, { status: 400 });
    }
    if (solution != null && (typeof solution !== 'string' || solution.length > 2000)) {
      return NextResponse.json({ error: 'Solution must be 2000 characters or fewer' }, { status: 400 });
    }

    let normalizedVideoUrl: string | null = null;
    if (videoUrl) {
      try {
        const parsedUrl = new URL(videoUrl);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Invalid protocol');
        normalizedVideoUrl = parsedUrl.toString();
      } catch {
        return NextResponse.json({ error: 'A valid video URL is required' }, { status: 400 });
      }
    }
    const allowedPlatforms = ['youtube', 'tiktok', 'instagram', 'other'];
    if (videoPlatform != null && !allowedPlatforms.includes(videoPlatform)) {
      return NextResponse.json({ error: 'Invalid video platform' }, { status: 400 });
    }

    const { data: challenge, error: challengeError } = await auth.client
      .from('daily_challenges')
      .select('date')
      .eq('id', challengeId)
      .maybeSingle();

    if (challengeError) throw challengeError;
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }
    if (challenge.date !== new Date().toISOString().slice(0, 10)) {
      return NextResponse.json({ error: 'Submissions are closed for this challenge' }, { status: 410 });
    }

    const { data: submission, error: submissionError } = await auth.client
      .from('challenge_submissions')
      .insert({
        challenge_id: challengeId,
        user_id: auth.user.id,
        time_ms: timeMs,
        solution: solution?.trim() || null,
        video_url: normalizedVideoUrl,
        video_platform: normalizedVideoUrl ? videoPlatform || 'other' : null,
        notes: typeof notes === 'string' ? notes.slice(0, 1000) : null
      })
      .select()
      .single();

    if (submissionError?.code === '23505') {
      return NextResponse.json({ error: 'A result has already been submitted for this challenge' }, { status: 409 });
    }
    if (submissionError) throw submissionError;

    const { error: streakError } = await auth.client.rpc('update_challenge_streak', {
      p_user_id: auth.user.id,
      p_challenge_date: challenge.date
    });
    if (streakError) console.error('Error updating challenge streak:', streakError);

    return NextResponse.json({ submission });

  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
}