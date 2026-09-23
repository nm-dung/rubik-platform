-- FIX ALGORITHM STATS CALCULATION
-- Run this in your Supabase SQL Editor to fix the average time calculation

-- First, fix the existing data by recalculating averages based on actual session times
UPDATE algorithm_practice_stats s
SET 
  avg_time_ms = (
    SELECT AVG(time_ms)::NUMERIC 
    FROM algorithm_practice_sessions 
    WHERE user_id = s.user_id AND algorithm_id = s.algorithm_id
  ),
  total_time_ms = (
    SELECT SUM(time_ms) 
    FROM algorithm_practice_sessions 
    WHERE user_id = s.user_id AND algorithm_id = s.algorithm_id
  ),
  practice_count = (
    SELECT COUNT(*) 
    FROM algorithm_practice_sessions 
    WHERE user_id = s.user_id AND algorithm_id = s.algorithm_id
  ),
  best_time_ms = (
    SELECT MIN(time_ms) 
    FROM algorithm_practice_sessions 
    WHERE user_id = s.user_id AND algorithm_id = s.algorithm_id
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE EXISTS (
  SELECT 1 FROM algorithm_practice_sessions 
  WHERE user_id = s.user_id AND algorithm_id = s.algorithm_id
);

-- Update the function to use correct calculation
CREATE OR REPLACE FUNCTION update_algorithm_practice_stats(
  p_user_id UUID,
  p_algorithm_id TEXT,
  p_time_ms INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_new_count INTEGER;
  v_new_total_time INTEGER;
  v_new_avg NUMERIC;
BEGIN
  -- Get current stats or initialize
  SELECT 
    COALESCE(practice_count, 0) + 1,
    COALESCE(total_time_ms, 0) + p_time_ms
  INTO v_new_count, v_new_total_time
  FROM algorithm_practice_stats
  WHERE user_id = p_user_id AND algorithm_id = p_algorithm_id;
  
  -- Calculate new average
  v_new_avg := v_new_total_time::NUMERIC / v_new_count;
  
  -- Insert or update stats
  INSERT INTO algorithm_practice_stats (user_id, algorithm_id, practice_count, total_time_ms, best_time_ms, avg_time_ms, last_practiced)
  VALUES (p_user_id, p_algorithm_id, 1, p_time_ms, p_time_ms, p_time_ms::NUMERIC, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, algorithm_id)
  DO UPDATE SET
    practice_count = v_new_count,
    total_time_ms = v_new_total_time,
    best_time_ms = LEAST(algorithm_practice_stats.best_time_ms, p_time_ms),
    avg_time_ms = v_new_avg,
    last_practiced = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP;

  -- Record the individual session
  INSERT INTO algorithm_practice_sessions (user_id, algorithm_id, time_ms)
  VALUES (p_user_id, p_algorithm_id, p_time_ms);
END;
$$ LANGUAGE plpgsql;