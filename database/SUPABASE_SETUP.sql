-- Create profiles table for user roles and admin management
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'coach', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add status column to lessons (draft or published)
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published'));

-- Add image_url to lessons if it does not exist
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add status column to algorithms (draft or published)
ALTER TABLE algorithms
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published'));

-- Add image_url and alternate_notations to algorithms if they do not exist
ALTER TABLE algorithms
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE algorithms
ADD COLUMN IF NOT EXISTS alternate_notations TEXT;

-- Optional: create a helper index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lessons_difficulty ON lessons(difficulty);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons("order");
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_algorithms_category ON algorithms(category);
CREATE INDEX IF NOT EXISTS idx_algorithms_status ON algorithms(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
