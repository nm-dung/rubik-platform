import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * PATCH /api/admin/submissions/[id]
 * Update contribution request status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 500 }
      );
    }

    const resolvedParams = await params;
    const { status } = await request.json();

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('contribution_requests')
      .update({ status })
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating submission:', error);
      return NextResponse.json(
        { error: 'Failed to update submission' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in submission update API:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
