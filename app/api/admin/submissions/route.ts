import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/admin/submissions
 * Fetch all contribution requests
 */
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('contribution_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching submissions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (err) {
    console.error('Unexpected error in submissions API:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
