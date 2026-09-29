import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin, isAdminConfigured } from '@/lib/supabase-admin';
import { getAuthenticatedSupabase } from '@/lib/api-auth';
import { getUserRole } from '@/lib/services/adminService';
import { generateScramble, validateScramble } from '@/lib/scrambleGenerator';

/**
 * GET /api/daily-challenge
 * Get the current day's challenge or create one if it doesn't exist
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const date = new Date().toISOString().slice(0, 10);

    const { data: existingChallenge, error: fetchError } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('date', date)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (existingChallenge) {
      return NextResponse.json({ challenge: existingChallenge });
    }

    if (!isAdminConfigured()) {
      return NextResponse.json({ error: 'Server database access is not configured' }, { status: 503 });
    }

    const { data: newChallenge, error: createError } = await supabaseAdmin
      .from('daily_challenges')
      .insert({ scramble: generateScramble(), date, difficulty: 'intermediate' })
      .select()
      .single();

    if (createError?.code === '23505') {
      const { data: concurrentChallenge, error: concurrentFetchError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('date', date)
        .single();
      if (concurrentFetchError) throw concurrentFetchError;
      return NextResponse.json({ challenge: concurrentChallenge });
    }
    if (createError) throw createError;

    return NextResponse.json({ challenge: newChallenge });

  } catch (error) {
    console.error('Error fetching daily challenge:', error);
    return NextResponse.json({ error: 'Failed to fetch daily challenge' }, { status: 500 });
  }
}

/**
 * POST /api/daily-challenge
 * Create a new daily challenge (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSupabase(request);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    if (!isAdminConfigured()) {
      return NextResponse.json({ error: 'Server database access is not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { scramble, date, difficulty } = body;
    const role = await getUserRole(auth.user.id);
    if (role !== 'admin' && role !== 'coach') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    if (typeof scramble !== 'string' || !validateScramble(scramble)) {
      return NextResponse.json({ error: 'Invalid scramble' }, { status: 400 });
    }
    const challengeDate = typeof date === 'string' && date ? date : new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(challengeDate) || new Date(`${challengeDate}T00:00:00.000Z`).toISOString().slice(0, 10) !== challengeDate) {
      return NextResponse.json({ error: 'Invalid challenge date' }, { status: 400 });
    }
    const challengeDifficulty = typeof difficulty === 'string' && ['beginner', 'intermediate', 'advanced'].includes(difficulty) ? difficulty : 'intermediate';

    const { data, error } = await supabaseAdmin
      .from('daily_challenges')
      .insert({
        scramble,
        date: challengeDate,
        difficulty: challengeDifficulty
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ challenge: data });

  } catch (error) {
    console.error('Error creating daily challenge:', error);
    return NextResponse.json({ error: 'Failed to create daily challenge' }, { status: 500 });
  }
}