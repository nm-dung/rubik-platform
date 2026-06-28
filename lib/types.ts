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
  difficulty: number;
  image_url?: string;
  created_at?: string;
}

export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced';

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
  created_at?: string;
  updated_at?: string;
}

export interface LessonProgress {
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at?: string;
  review_count: number;
  last_reviewed?: string;
}
