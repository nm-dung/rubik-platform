-- SUPABASE SQL SETUP FOR LESSON REVIEW HISTORY TABLE
-- Run this in your Supabase SQL Editor to create the lesson_review_history table

-- Create lesson_review_history table
CREATE TABLE IF NOT EXISTS lesson_review_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lesson_review_history_user_id ON lesson_review_history(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_review_history_lesson_id ON lesson_review_history(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_review_history_reviewed_at ON lesson_review_history(reviewed_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE lesson_review_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own lesson review history" ON lesson_review_history;
DROP POLICY IF EXISTS "Users can insert own lesson review history" ON lesson_review_history;
DROP POLICY IF EXISTS "Users can delete own lesson review history" ON lesson_review_history;

-- Create policy to allow users to read their own review history
CREATE POLICY "Users can view own lesson review history"
    ON lesson_review_history FOR SELECT
    USING (auth.uid()::TEXT = user_id);

-- Create policy to allow users to insert their own review history
CREATE POLICY "Users can insert own lesson review history"
    ON lesson_review_history FOR INSERT
    WITH CHECK (auth.uid()::TEXT = user_id);

-- Create policy to allow users to delete their own review history
CREATE POLICY "Users can delete own lesson review history"
    ON lesson_review_history FOR DELETE
    USING (auth.uid()::TEXT = user_id);
