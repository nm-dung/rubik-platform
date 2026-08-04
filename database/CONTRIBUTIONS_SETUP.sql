-- Run this in Supabase SQL Editor to enable future coach contribution requests

CREATE TABLE IF NOT EXISTS contribution_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT,
  lesson_title TEXT,
  contribution_type TEXT NOT NULL,
  submitted_by TEXT,
  role TEXT,
  details TEXT NOT NULL,
  locale TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contribution_requests_status ON contribution_requests(status);
CREATE INDEX IF NOT EXISTS idx_contribution_requests_created_at ON contribution_requests(created_at DESC);
