-- SUPABASE SQL SETUP FOR LESSON PROGRESS TABLE
-- Run this in your Supabase SQL Editor to create the lesson_progress table

-- Create lesson_progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  review_count INT DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_completed ON lesson_progress(completed);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own progress
CREATE POLICY "Users can view own lesson progress"
    ON lesson_progress FOR SELECT
    USING (auth.uid()::TEXT = user_id);

-- Create policy to allow users to insert their own progress
CREATE POLICY "Users can insert own lesson progress"
    ON lesson_progress FOR INSERT
    WITH CHECK (auth.uid()::TEXT = user_id);

-- Create policy to allow users to update their own progress
CREATE POLICY "Users can update own lesson progress"
    ON lesson_progress FOR UPDATE
    USING (auth.uid()::TEXT = user_id);

-- Create policy to allow users to delete their own progress
CREATE POLICY "Users can delete own lesson progress"
    ON lesson_progress FOR DELETE
    USING (auth.uid()::TEXT = user_id);
