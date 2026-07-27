import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Use service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    console.log('Deleting account for userId:', userId);

    // Delete user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error deleting user profile:', profileError);
    } else {
      console.log('User profile deleted');
    }

    // Delete lesson progress
    const { error: progressError } = await supabaseAdmin
      .from('lesson_progress')
      .delete()
      .eq('user_id', userId);
    
    if (progressError) {
      console.error('Error deleting lesson progress:', progressError);
    } else {
      console.log('Lesson progress deleted');
    }

    // Delete lesson review history
    const { error: historyError } = await supabaseAdmin
      .from('lesson_review_history')
      .delete()
      .eq('user_id', userId);
    
    if (historyError) {
      console.error('Error deleting review history:', historyError);
    } else {
      console.log('Review history deleted');
    }

    // Delete algorithm practice stats (if table exists)
    try {
      const { error: statsError } = await supabaseAdmin
        .from('algorithm_practice_stats')
        .delete()
        .eq('user_id', userId);
      
      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error deleting algorithm stats:', statsError);
      } else {
        console.log('Algorithm stats deleted or table does not exist');
      }
    } catch (e) {
      console.log('Algorithm stats table does not exist, skipping');
    }

    // Delete algorithm practice sessions (if table exists)
    try {
      const { error: sessionsError } = await supabaseAdmin
        .from('algorithm_practice_sessions')
        .delete()
        .eq('user_id', userId);
      
      if (sessionsError && sessionsError.code !== 'PGRST116') {
        console.error('Error deleting algorithm sessions:', sessionsError);
      } else {
        console.log('Algorithm sessions deleted or table does not exist');
      }
    } catch (e) {
      console.log('Algorithm sessions table does not exist, skipping');
    }

    console.log('User data deleted successfully');

    // Then delete the user from auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting user from auth:', authError);
      return NextResponse.json(
        { error: `Failed to delete user account: ${authError.message}` },
        { status: 500 }
      );
    }

    console.log('User account deleted successfully');
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in delete account API:', err);
    return NextResponse.json(
      { error: `Internal server error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
