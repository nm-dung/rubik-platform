/**
 * Shared types for the Rubik's Learning Platform
 * This is the single source of truth for our domain models
 */

export type Category = 'F2L' | 'OLL' | 'PLL';

export interface Algorithm {
  id: string;
  name_en: string;
  name_vi: string;
  category: Category;
  notation: string;
  alternate_notations?: string;
  difficulty: number;
  image_url?: string;
  status?: 'draft' | 'published';
  created_at?: string;
}

export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type LearningPath = 'beginner' | 'advanced' | 'both';

export interface Lesson {
  id: string;
  title_en: string;
  title_vi: string;
  description_en: string;
  description_vi: string;
  content_en?: string;
  content_vi?: string;
  difficulty: LessonDifficulty;
  order: number;
  duration_minutes?: number;
  related_algorithm_ids?: string[];
  image_url?: string;
  learning_path?: LearningPath;
  status?: 'draft' | 'published';
  created_at?: string;
  updated_at?: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at?: string;
  review_count: number;
  last_reviewed?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LessonReviewHistory {
  id: string;
  user_id: string;
  lesson_id: string;
  reviewed_at: string;
  notes?: string;
  created_at?: string;
}

export interface AlgorithmPracticeStats {
  id?: string;
  user_id: string;
  algorithm_id: string;
  practice_count: number;
  total_time_ms: number;
  best_time_ms?: number;
  avg_time_ms?: number;
  last_practiced?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AlgorithmPracticeSession {
  id?: string;
  user_id: string;
  algorithm_id: string;
  time_ms: number;
  timestamp?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name_en: string;
  name_vi: string;
  description_en: string;
  description_vi: string;
  icon: string;
  requirement_type: 'lessons_completed' | 'algorithms_practiced' | 'streak_days' | 'avg_time' | 'total_solves';
  requirement_value: number;
  points: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}
