-- ============================================================
-- ALGORITHM TRAINER - PRACTICE STATISTICS
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Create algorithm practice statistics table
CREATE TABLE IF NOT EXISTS algorithm_practice_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  algorithm_id TEXT NOT NULL,
  practice_count INTEGER DEFAULT 0,
  total_time_ms INTEGER DEFAULT 0,
  best_time_ms INTEGER,
  avg_time_ms NUMERIC,
  last_practiced TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, algorithm_id)
);

-- Create index for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_algorithm_stats_user ON algorithm_practice_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_algorithm_stats_algorithm ON algorithm_practice_stats(algorithm_id);
CREATE INDEX IF NOT EXISTS idx_algorithm_stats_user_algorithm ON algorithm_practice_stats(user_id, algorithm_id);

-- Create individual practice sessions table (for detailed history)
CREATE TABLE IF NOT EXISTS algorithm_practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  algorithm_id TEXT NOT NULL,
  time_ms INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for session queries
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON algorithm_practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_algorithm ON algorithm_practice_sessions(algorithm_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_timestamp ON algorithm_practice_sessions(timestamp DESC);

-- Function to update algorithm stats after a practice session
CREATE OR REPLACE FUNCTION update_algorithm_practice_stats(
  p_user_id UUID,
  p_algorithm_id TEXT,
  p_time_ms INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO algorithm_practice_stats (user_id, algorithm_id, practice_count, total_time_ms, best_time_ms, avg_time_ms, last_practiced)
  VALUES (p_user_id, p_algorithm_id, 1, p_time_ms, p_time_ms, p_time_ms, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, algorithm_id)
  DO UPDATE SET
    practice_count = algorithm_practice_stats.practice_count + 1,
    total_time_ms = algorithm_practice_stats.total_time_ms + p_time_ms,
    best_time_ms = LEAST(algorithm_practice_stats.best_time_ms, p_time_ms),
    avg_time_ms = (algorithm_practice_stats.total_time_ms + p_time_ms)::NUMERIC / (algorithm_practice_stats.practice_count + 1),
    last_practiced = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP;

  -- Record the individual session
  INSERT INTO algorithm_practice_sessions (user_id, algorithm_id, time_ms)
  VALUES (p_user_id, p_algorithm_id, p_time_ms);
END;
$$ LANGUAGE plpgsql;
