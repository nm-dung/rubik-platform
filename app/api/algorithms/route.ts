import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/algorithms
 * Fetch all algorithms, optionally filtered by category or search
 *
 * Query params:
 * - category?: 'F2L' | 'OLL' | 'PLL'
 * - search?: string - search in name_en, name_vi, notation
 */
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json([], { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase.from('algorithms').select('*').order('category').order('difficulty');

    if (category && ['F2L', 'OLL', 'PLL'].includes(category)) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name_en.ilike.%${search}%,name_vi.ilike.%${search}%,notation.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching algorithms:', error);
      return NextResponse.json(
        { error: 'Failed to fetch algorithms' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (err) {
    console.error('Unexpected error in algorithms API:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
