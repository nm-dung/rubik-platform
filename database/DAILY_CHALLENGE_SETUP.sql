-- SUPABASE SQL: Daily Scramble Challenge System
-- This enables daily scramble challenges with time submissions, videos, and solutions
-- Run this in your Supabase SQL Editor

-- Daily challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scramble TEXT NOT NULL,
  date DATE NOT NULL UNIQUE,
  difficulty TEXT DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Challenge submissions table
CREATE TABLE IF NOT EXISTS challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  time_ms INTEGER NOT NULL,
  solution TEXT, -- Algorithm solution notation
  video_url TEXT, -- URL to solve video
  video_platform TEXT, -- 'youtube', 'tiktok', 'instagram', etc.
  notes TEXT, -- Additional notes about the solve
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(challenge_id, user_id)
);

-- Solution votes table
CREATE TABLE IF NOT EXISTS solution_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES challenge_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type TEXT DEFAULT 'up' CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(submission_id, user_id)
);

-- Daily challenge streaks table
CREATE TABLE IF NOT EXISTS daily_challenge_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_participation_date DATE,
  total_challenges_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(date DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_challenge ON challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_user ON challenge_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_time ON challenge_submissions(time_ms);
CREATE INDEX IF NOT EXISTS idx_solution_votes_submission ON solution_votes(submission_id);
CREATE INDEX IF NOT EXISTS idx_solution_votes_user ON solution_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenge_streaks_user ON daily_challenge_streaks(user_id);

-- Enable Row Level Security
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenge_streaks ENABLE ROW LEVEL SECURITY;

-- Policies for daily challenges (public read, admin write)
DROP POLICY IF EXISTS "Public can view daily challenges" ON daily_challenges;
CREATE POLICY "Public can view daily challenges"
  ON daily_challenges FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can create daily challenges" ON daily_challenges;
CREATE POLICY "Admins can create daily challenges"
  ON daily_challenges FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

DROP POLICY IF EXISTS "Admins can update daily challenges" ON daily_challenges;
CREATE POLICY "Admins can update daily challenges"
  ON daily_challenges FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Policies for challenge submissions
DROP POLICY IF EXISTS "Users can view submissions" ON challenge_submissions;
CREATE POLICY "Users can view submissions"
  ON challenge_submissions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create own submissions" ON challenge_submissions;
CREATE POLICY "Users can create own submissions"
  ON challenge_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own submissions" ON challenge_submissions;
CREATE POLICY "Users can update own submissions"
  ON challenge_submissions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own submissions" ON challenge_submissions;
CREATE POLICY "Users can delete own submissions"
  ON challenge_submissions FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for solution votes
DROP POLICY IF EXISTS "Users can view votes" ON solution_votes;
CREATE POLICY "Users can view votes"
  ON solution_votes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create own votes" ON solution_votes;
CREATE POLICY "Users can create own votes"
  ON solution_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own votes" ON solution_votes;
CREATE POLICY "Users can update own votes"
  ON solution_votes FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own votes" ON solution_votes;
CREATE POLICY "Users can delete own votes"
  ON solution_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for challenge streaks
DROP POLICY IF EXISTS "Users can view own streaks" ON daily_challenge_streaks;
CREATE POLICY "Users can view own streaks"
  ON daily_challenge_streaks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own streaks" ON daily_challenge_streaks;
CREATE POLICY "Users can manage own streaks"
  ON daily_challenge_streaks FOR ALL
  USING (auth.uid() = user_id);

-- Function to update daily challenge streaks
CREATE OR REPLACE FUNCTION update_challenge_streak(p_user_id UUID, p_challenge_date DATE)
RETURNS VOID AS $$
DECLARE
  v_streak daily_challenge_streaks%ROWTYPE;
  v_new_current_streak INTEGER;
  v_new_longest_streak INTEGER;
BEGIN
  -- Get current streak record
  SELECT * INTO v_streak FROM daily_challenge_streaks WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO daily_challenge_streaks (user_id, current_streak, longest_streak, last_participation_date, total_challenges_completed)
    VALUES (p_user_id, 1, 1, p_challenge_date, 1);
  ELSE
    -- Check if this is consecutive day
    IF v_streak.last_participation_date = p_challenge_date - INTERVAL '1 day' THEN
      -- Consecutive day, increment streak
      v_new_current_streak := v_streak.current_streak + 1;
      v_new_longest_streak := GREATEST(v_streak.longest_streak, v_new_current_streak);
      
      UPDATE daily_challenge_streaks
      SET 
        current_streak = v_new_current_streak,
        longest_streak = v_new_longest_streak,
        last_participation_date = p_challenge_date,
        total_challenges_completed = total_challenges_completed + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = p_user_id;
    ELSIF v_streak.last_participation_date = p_challenge_date THEN
      -- Already submitted today, just update total
      UPDATE daily_challenge_streaks
      SET total_challenges_completed = total_challenges_completed + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = p_user_id;
    ELSE
      -- Streak broken, start fresh
      UPDATE daily_challenge_streaks
      SET 
        current_streak = 1,
        longest_streak = GREATEST(longest_streak, 1),
        last_participation_date = p_challenge_date,
        total_challenges_completed = total_challenges_completed + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = p_user_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;