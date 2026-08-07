-- Create user_streaks table for tracking user activity streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can insert own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON user_streaks;

-- RLS Policies: Users can only read/write their own streak data
CREATE POLICY "Users can view own streaks"
  ON user_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON user_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON user_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  current_streak_record RECORD;
  today_date DATE := CURRENT_DATE;
  yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
  -- Get current streak record
  SELECT * INTO current_streak_record
  FROM user_streaks
  WHERE user_id = user_uuid;

  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (user_uuid, 1, 1, today_date);
  ELSE
    -- Check if last activity was today
    IF current_streak_record.last_activity_date = today_date THEN
      -- Already logged today, no change needed
      RETURN;
    -- Check if last activity was yesterday
    ELSIF current_streak_record.last_activity_date = yesterday_date THEN
      -- Continue streak
      UPDATE user_streaks
      SET
        current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = today_date,
        updated_at = NOW()
      WHERE user_id = user_uuid;
    ELSE
      -- Streak broken, start fresh
      UPDATE user_streaks
      SET
        current_streak = 1,
        last_activity_date = today_date,
        updated_at = NOW()
      WHERE user_id = user_uuid;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_vi TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_vi TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('lessons_completed', 'algorithms_practiced', 'streak_days', 'avg_time', 'total_solves')),
  requirement_value INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clean up duplicate achievement rows before adding the uniqueness guard.
WITH ranked AS (
  SELECT id,
         name_en,
         requirement_type,
         requirement_value,
         ROW_NUMBER() OVER (
           PARTITION BY name_en, requirement_type, requirement_value
           ORDER BY created_at ASC, id ASC
         ) AS rn
  FROM achievements
), keep_rows AS (
  SELECT id AS keep_id,
         name_en,
         requirement_type,
         requirement_value
  FROM ranked
  WHERE rn = 1
)
UPDATE user_achievements ua
SET achievement_id = kr.keep_id
FROM ranked r
JOIN keep_rows kr
  ON kr.name_en = r.name_en
 AND kr.requirement_type = r.requirement_type
 AND kr.requirement_value = r.requirement_value
WHERE ua.achievement_id = r.id
  AND r.rn > 1;

WITH ranked AS (
  SELECT id,
         name_en,
         requirement_type,
         requirement_value,
         ROW_NUMBER() OVER (
           PARTITION BY name_en, requirement_type, requirement_value
           ORDER BY created_at ASC, id ASC
         ) AS rn
  FROM achievements
)
DELETE FROM achievements a
USING ranked r
WHERE a.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_achievements_unique_name_req
  ON achievements (name_en, requirement_type, requirement_value);

-- Enable RLS and expose achievements publicly so the app can read them.
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  USING (true);

-- Insert some default achievements
INSERT INTO achievements (name_en, name_vi, description_en, description_vi, icon, requirement_type, requirement_value, points) VALUES
('First Steps', 'Bước đầu tiên', 'Complete your first lesson', 'Hoàn thành bài học đầu tiên', '🎯', 'lessons_completed', 1, 10),
('Quick Learner', 'Học nhanh', 'Complete 5 lessons', 'Hoàn thành 5 bài học', '📚', 'lessons_completed', 5, 25),
('Dedicated Student', 'Học viên tận tâm', 'Complete 10 lessons', 'Hoàn thành 10 bài học', '🎓', 'lessons_completed', 10, 50),
('Algorithm Beginner', 'Người mới thuật toán', 'Practice 10 algorithms', 'Luyện 10 thuật toán', '🧩', 'algorithms_practiced', 10, 25),
('Algorithm Master', 'Bậc thầy thuật toán', 'Practice 50 algorithms', 'Luyện 50 thuật toán', '🏆', 'algorithms_practiced', 50, 100),
('3-Day Streak', 'Chuỗi 3 ngày', 'Maintain a 3-day activity streak', 'Duy trì chuỗi hoạt động 3 ngày', '🔥', 'streak_days', 3, 15),
('7-Day Streak', 'Chuỗi 7 ngày', 'Maintain a 7-day activity streak', 'Duy trì chuỗi hoạt động 7 ngày', '⚡', 'streak_days', 7, 35),
('30-Day Streak', 'Chuỗi 30 ngày', 'Maintain a 30-day activity streak', 'Duy trì chuỗi hoạt động 30 ngày', '💎', 'streak_days', 30, 100),
('Speed Demon', 'Tốc độ', 'Achieve an average time under 5 seconds', 'Đạt thời gian trung bình dưới 5 giây', '⚡', 'avg_time', 5000, 50),
('Century Club', 'Câu lạc bộ trăm', 'Complete 100 total solves', 'Hoàn thành 100 lần giải tổng cộng', '💯', 'total_solves', 100, 75)
ON CONFLICT DO NOTHING;

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;

-- RLS Policies
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Replace the broken function with a placeholder
-- Achievement checking is now done in the API using frontend data
CREATE OR REPLACE FUNCTION check_and_unlock_achievements(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- This function is no longer needed
  -- Achievement checking is now done in the API using frontend data
  RETURN;
END;
$$ LANGUAGE plpgsql;
