import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper function to get user ID
function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try to get from localStorage (Supabase stores session there)
  const session = localStorage.getItem('sb-rubik-platform-auth-token');
  if (session) {
    try {
      const parsed = JSON.parse(session);
      return parsed.user?.id || null;
    } catch {
      return null;
    }
  }
  
  return null;
}

// Temporary user ID fallback for when auth is not available
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';

function getCurrentUserId(): string {
  return getUserId() || TEMP_USER_ID;
}

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
        const userId = getCurrentUserId();
        
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

        // Sync with database (fire and forget - don't revert on error)
        fetch('/api/lesson-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            lessonId,
            completed: !isCurrentlyCompleted,
          }),
        }).catch(error => {
          console.error('Error syncing lesson progress (saved locally only):', error);
        });
      },

      incrementReview: async (lessonId: string) => {
        const currentState = get();
        const currentProgress = currentState.lessonProgress[lessonId] || { completed: false, reviewCount: 0 };
        const userId = getCurrentUserId();
        
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

        // Sync with database (fire and forget - don't revert on error)
        fetch('/api/lesson-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            lessonId,
            incrementReview: true,
          }),
        }).catch(error => {
          console.error('Error syncing lesson review (saved locally only):', error);
        });

        // Create review history entry (separate call)
        fetch('/api/lesson-review-history/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            lessonId,
          }),
        }).catch(error => {
          console.error('Error creating review history entry:', error);
        });
      },

      syncWithDatabase: async () => {
        set({ isLoading: true });
        const userId = getCurrentUserId();
        try {
          const response = await fetch(`/api/lesson-progress?userId=${userId}`);
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
