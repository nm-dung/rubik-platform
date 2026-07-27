-- SUPABASE SQL: Delete User Function
-- This function deletes a user account and all their data
-- Run this in your Supabase SQL Editor

-- Create function to delete user and all their data
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete lesson progress
  DELETE FROM lesson_progress WHERE user_id = auth.uid()::TEXT;
  
  -- Delete lesson review history
  DELETE FROM lesson_review_history WHERE user_id = auth.uid()::TEXT;
  
  -- Delete algorithm practice stats (if table exists)
  BEGIN
    DELETE FROM algorithm_practice_stats WHERE user_id = auth.uid()::TEXT;
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, skip
  END;
  
  -- Delete algorithm practice sessions (if table exists)
  BEGIN
    DELETE FROM algorithm_practice_sessions WHERE user_id = auth.uid()::TEXT;
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, skip
  END;
  
  -- Delete the user from auth.users
  -- This requires the service role key, so we use the admin API
  -- The actual deletion will be handled by the API route
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user TO authenticated;
