import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const { data, error } = await supabase.from('contribution_requests').insert({
      lesson_id: payload.lessonId,
      lesson_title: payload.lessonTitle,
      contribution_type: payload.contributionType,
      submitted_by: payload.submittedBy,
      role: payload.role,
      details: payload.details,
      locale: payload.locale,
      status: 'pending',
    });

    if (error) {
      console.error('Supabase contribution insert failed:', error);
      return NextResponse.json(
        { error: 'Unable to save contribution request right now.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('Contribution API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
