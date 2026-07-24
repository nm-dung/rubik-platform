-- ============================================================
-- LEARNING PATHS MIGRATION
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Add learning_path column to lessons table
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS learning_path TEXT DEFAULT 'advanced'
CHECK (learning_path IN ('beginner', 'advanced', 'both'));

-- Update existing lessons to categorize them
-- Your current sample lessons are advanced/self-directed
UPDATE lessons
SET learning_path = 'advanced'
WHERE learning_path IS NULL OR learning_path = 'advanced';

-- Create index for faster path-based queries
CREATE INDEX IF NOT EXISTS idx_lessons_learning_path ON lessons(learning_path);
CREATE INDEX IF NOT EXISTS idx_lessons_path_order ON lessons(learning_path, "order");

-- ============================================================
-- EXAMPLE: How to structure beginner path lessons
-- ============================================================

-- Beginner path lessons should have:
-- - learning_path = 'beginner'
-- - Sequential order (1, 2, 3, 4...)
-- - Clear dependencies (each lesson builds on previous)
-- - Complete beginners as target audience

-- Example beginner lesson:
-- INSERT INTO lessons (
--   id, 
--   title_en, 
--   title_vi, 
--   description_en, 
--   description_vi, 
--   difficulty, 
--   "order", 
--   duration_minutes, 
--   learning_path,
--   related_algorithm_ids
-- ) VALUES (
--   'beginner-001',
--   'Lesson 1: Cube Basics',
--   'Bài 1: Cơ bản về Khối',
--   'Learn cube anatomy and notation',
--   'Tìm hiểu giải phẫu khối và ký hiệu',
--   'beginner',
--   1,
--   15,
--   'beginner',
--   '{}'
-- );

-- ============================================================
-- EXAMPLE: How to structure advanced path lessons
-- ============================================================

-- Advanced path lessons should have:
-- - learning_path = 'advanced'
-- - Order is for organization, not strict sequence
-- - Users can choose any lesson
-- - Target audience: knows basics, wants to improve

-- Example advanced lesson:
-- INSERT INTO lessons (
--   id,
--   title_en,
--   title_vi,
--   description_en,
--   description_vi,
--   difficulty,
--   "order",
--   duration_minutes,
--   learning_path,
--   related_algorithm_ids
-- ) VALUES (
--   'cfop-f2l-001',
--   'F2L: Basic Cases',
--   'F2L: Các trường hợp cơ bản',
--   'Learn fundamental F2L pair insertions',
--   'Tìm hiểu cách chèn cặp F2L cơ bản',
--   'intermediate',
--   1,
--   30,
--   'advanced',
--   '{}'
-- );
