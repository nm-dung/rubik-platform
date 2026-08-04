import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { UserStreak } from '@/lib/types';

export async function GET(request: Request) {
  void request;
  try {
    const supabase = await createServerSupabaseClient();

    // Get user from session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null
      } as Partial<UserStreak>);
    }
    
    const { data: streak, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no streak record exists, return default values
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: null
        } as Partial<UserStreak>);
      }
      throw error;
    }

    return NextResponse.json(streak);
  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streak data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  void request;
  try {
    const supabase = await createServerSupabaseClient();

    // Get user from session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null
      } as Partial<UserStreak>);
    }
    
    // Call the PostgreSQL function to update streak
    const { error } = await supabase.rpc('update_user_streak', {
      user_uuid: user.id
    });

    if (error) throw error;

    // Fetch updated streak data
    const { data: streak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json(streak);
  } catch (error) {
    console.error('Error updating streak:', error);
    return NextResponse.json(
      { error: 'Failed to update streak' },
      { status: 500 }
    );
  }
}
