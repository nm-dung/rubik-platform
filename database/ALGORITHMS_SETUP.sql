-- SUPABASE SQL SETUP FOR ALGORITHMS TABLE
-- Run this in your Supabase SQL Editor to create the algorithms table

CREATE TABLE IF NOT EXISTS algorithms (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_vi TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('F2L', 'OLL', 'PLL')),
  notation TEXT NOT NULL,
  difficulty INT NOT NULL DEFAULT 1,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_algorithms_category ON algorithms(category);
CREATE INDEX IF NOT EXISTS idx_algorithms_difficulty ON algorithms(difficulty);

-- Example seed rows
INSERT INTO algorithms (id, name_en, name_vi, category, notation, difficulty) VALUES
('alg-pll-001', 'T Perm', 'Hoán vị T', 'PLL', 'R U R'' U'' R'' F R2 U'' R'' U'' R U R'' F''', 3)
ON CONFLICT (id) DO NOTHING;
