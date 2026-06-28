import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LessonProgressStore {
  completedLessonIds: string[];
  toggleCompletedLesson: (lessonId: string) => void;
}

export const useLessonProgressStore = create<LessonProgressStore>()(
  persist(
    (set) => ({
      completedLessonIds: [],
      toggleCompletedLesson: (lessonId: string) =>
        set((state) => ({
          completedLessonIds: state.completedLessonIds.includes(lessonId)
            ? state.completedLessonIds.filter((id) => id !== lessonId)
            : [...state.completedLessonIds, lessonId],
        })),
    }),
    {
      name: 'rubik-lesson-progress',
    }
  )
);
