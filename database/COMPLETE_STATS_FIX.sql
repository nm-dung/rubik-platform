-- COMPLETE STATS SYSTEM FIX
-- This will completely rebuild the stats system to ensure accuracy
-- Run this in your Supabase SQL Editor

-- Step 1: Clear all existing corrupted data
DELETE FROM algorithm_practice_sessions;
DELETE FROM algorithm_practice_stats;

-- Step 2: Create a completely new, simpler approach
-- Instead of using a complex function, we'll use direct inserts

-- Step 3: Create a simpler, more reliable function
CREATE OR REPLACE FUNCTION update_algorithm_practice_stats_simple(
  p_user_id UUID,
  p_algorithm_id TEXT,
  p_time_ms INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Insert the session record first
  INSERT INTO algorithm_practice_sessions (user_id, algorithm_id, time_ms)
  VALUES (p_user_id, p_algorithm_id, p_time_ms);
  
  -- Then update or create the stats record with accurate calculations
  INSERT INTO algorithm_practice_stats (user_id, algorithm_id, practice_count, total_time_ms, best_time_ms, avg_time_ms, last_practiced)
  VALUES (
    p_user_id, 
    p_algorithm_id, 
    1, 
    p_time_ms, 
    p_time_ms, 
    p_time_ms::NUMERIC, 
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (user_id, algorithm_id)
  DO UPDATE SET
    practice_count = (
      SELECT COUNT(*) 
      FROM algorithm_practice_sessions 
      WHERE user_id = p_user_id AND algorithm_id = p_algorithm_id
    ),
    total_time_ms = (
      SELECT SUM(time_ms) 
      FROM algorithm_practice_sessions 
      WHERE user_id = p_user_id AND algorithm_id = p_algorithm_id
    ),
    best_time_ms = (
      SELECT MIN(time_ms) 
      FROM algorithm_practice_sessions 
      WHERE user_id = p_user_id AND algorithm_id = p_algorithm_id
    ),
    avg_time_ms = (
      SELECT AVG(time_ms)::NUMERIC 
      FROM algorithm_practice_sessions 
      WHERE user_id = p_user_id AND algorithm_id = p_algorithm_id
    ),
    last_practiced = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Update the API to use the new function name
-- (This will be done in the code)

-- Step 5: Test the function
-- You can test this manually with:
-- SELECT update_algorithm_practice_stats_simple('your-user-id', 'alg-id', 1000);