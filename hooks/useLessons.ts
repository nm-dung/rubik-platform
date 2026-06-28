import { useState, useEffect } from 'react';
import { Lesson, LessonDifficulty } from '@/lib/types';

/**
 * useLessons - Custom hook to fetch lessons from API
 * 
 * Usage:
 * const { lessons, loading, error } = useLessons();
 * const { lessons, loading, error } = useLessons('beginner');
 */
export function useLessons(difficulty?: LessonDifficulty) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLessons() {
      try {
        const url = '/api/lessons' + (difficulty ? `?difficulty=${difficulty}` : '');
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch lessons: ${response.statusText}`);
        }

        const data = await response.json();
        setLessons(data);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch lessons';
        setError(message);
        console.error('Error fetching lessons:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, [difficulty]);

  return { lessons, loading, error };
}
