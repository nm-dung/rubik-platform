-- SUPABASE SQL: Leaderboard Access Policies
-- This enables public read access to user profile data needed for leaderboards
-- Run this in your Supabase SQL Editor

-- Allow public read access to user profile fields needed for leaderboards
-- Users can see username, full_name, and avatar_url for rankings
DROP POLICY IF EXISTS "Public can view profile fields for leaderboards" ON user_profiles;

CREATE POLICY "Public can view profile fields for leaderboards"
  ON user_profiles FOR SELECT
  USING (true)
  WITH CHECK (false);

-- Allow public read access to algorithm practice stats for leaderboards
DROP POLICY IF EXISTS "Public can view algorithm stats for leaderboards" ON algorithm_practice_stats;

CREATE POLICY "Public can view algorithm stats for leaderboards"
  ON algorithm_practice_stats FOR SELECT
  USING (true)
  WITH CHECK (false);

-- Enable RLS on algorithm_practice_stats if not already enabled
ALTER TABLE algorithm_practice_stats ENABLE ROW LEVEL SECURITY;