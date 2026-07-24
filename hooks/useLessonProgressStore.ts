import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Temporary user ID until auth is implemented
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';

interface LessonProgressStore {
  completedLessonIds: string[];
  lessonProgress: Record<string, { completed: boolean; reviewCount: number; lastReviewed?: string }>;
  toggleCompletedLesson: (lessonId: string) => void;
  incrementReview: (lessonId: string) => void;
  syncWithDatabase: () => Promise<void>;
  isLoading: boolean;
}

export const useLessonProgressStore = create<LessonProgressStore>()(
  persist(
    (set, get) => ({
      completedLessonIds: [],
      lessonProgress: {},
      isLoading: false,
      
      toggleCompletedLesson: async (lessonId: string) => {
        const currentState = get();
        const isCurrentlyCompleted = currentState.completedLessonIds.includes(lessonId);
        
        // Optimistic update
        const newCompletedIds = isCurrentlyCompleted
          ? currentState.completedLessonIds.filter((id) => id !== lessonId)
          : [...currentState.completedLessonIds, lessonId];
        
        set({ 
          completedLessonIds: newCompletedIds,
          lessonProgress: {
            ...currentState.lessonProgress,
            [lessonId]: {
              completed: !isCurrentlyCompleted,
              reviewCount: currentState.lessonProgress[lessonId]?.reviewCount || 0,
              lastReviewed: currentState.lessonProgress[lessonId]?.lastReviewed,
            }
          }
        });

        // Sync with database
        try {
          const response = await fetch('/api/lesson-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: TEMP_USER_ID,
              lessonId,
              completed: !isCurrentlyCompleted,
            }),
          });

          if (!response.ok) {
            console.error('Failed to sync lesson progress with database');
            // Revert on error
            set({ completedLessonIds: currentState.completedLessonIds });
          }
        } catch (error) {
          console.error('Error syncing lesson progress:', error);
          // Revert on error
          set({ completedLessonIds: currentState.completedLessonIds });
        }
      },

      incrementReview: async (lessonId: string) => {
        const currentState = get();
        const currentProgress = currentState.lessonProgress[lessonId] || { completed: false, reviewCount: 0 };
        
        // Optimistic update
        set({
          lessonProgress: {
            ...currentState.lessonProgress,
            [lessonId]: {
              ...currentProgress,
              reviewCount: currentProgress.reviewCount + 1,
              lastReviewed: new Date().toISOString(),
            }
          }
        });

        // Sync with database
        try {
          const response = await fetch('/api/lesson-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: TEMP_USER_ID,
              lessonId,
              incrementReview: true,
            }),
          });

          if (!response.ok) {
            console.error('Failed to sync lesson review with database');
            // Revert on error
            set({
              lessonProgress: {
                ...currentState.lessonProgress,
                [lessonId]: currentProgress
              }
            });
          }
        } catch (error) {
          console.error('Error syncing lesson review:', error);
          // Revert on error
          set({
            lessonProgress: {
              ...currentState.lessonProgress,
              [lessonId]: currentProgress
            }
          });
        }
      },

      syncWithDatabase: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch(`/api/lesson-progress?userId=${TEMP_USER_ID}`);
          if (response.ok) {
            const data = await response.json();
            const completedIds = data
              .filter((p: any) => p.completed)
              .map((p: any) => p.lesson_id);
            
            const progressMap: Record<string, any> = {};
            data.forEach((p: any) => {
              progressMap[p.lesson_id] = {
                completed: p.completed,
                reviewCount: p.review_count || 0,
                lastReviewed: p.last_reviewed,
              };
            });

            set({
              completedLessonIds: completedIds,
              lessonProgress: progressMap,
            });
          }
        } catch (error) {
          console.error('Error syncing lesson progress from database:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'rubik-lesson-progress',
    }
  )
);
