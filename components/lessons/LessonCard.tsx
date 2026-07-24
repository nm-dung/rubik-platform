"use client";

import Link from "next/link";
import { Lesson, LessonDifficulty } from "@/lib/types";
import { BookOpen, Clock, ChevronRight, CheckCircle2, RotateCcw } from "lucide-react";
import { useLessonProgressStore } from "@/hooks/useLessonProgressStore";

interface LessonCardProps {
  lesson: Lesson;
  locale: 'en' | 'vi';
}

const difficultyColors: Record<LessonDifficulty, { bg: string; text: string; badge: string }> = {
  beginner: { bg: 'bg-green-50', text: 'text-green-900', badge: 'bg-green-100 text-green-700' },
  intermediate: { bg: 'bg-blue-50', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-700' },
  advanced: { bg: 'bg-purple-50', text: 'text-purple-900', badge: 'bg-purple-100 text-purple-700' },
};

export default function LessonCard({ lesson, locale }: LessonCardProps) {
  const completedLessonIds = useLessonProgressStore((state) => state.completedLessonIds);
  const lessonProgress = useLessonProgressStore((state) => state.lessonProgress);
  
  const title = locale === 'vi' ? lesson.title_vi : lesson.title_en;
  const description = locale === 'vi' ? lesson.description_vi : lesson.description_en;
  const colors = difficultyColors[lesson.difficulty];
  
  const isCompleted = completedLessonIds.includes(lesson.id);
  const progress = lessonProgress[lesson.id] || { completed: false, reviewCount: 0, lastReviewed: null };

  const difficultyLabel = {
    beginner: locale === 'vi' ? 'Cơ bản' : 'Beginner',
    intermediate: locale === 'vi' ? 'Trung cấp' : 'Intermediate',
    advanced: locale === 'vi' ? 'Nâng cao' : 'Advanced',
  }[lesson.difficulty];

  return (
    <Link href={`/${locale}/learn/${lesson.id}`} className="block group">
      <div className={`${colors.bg} border-2 ${isCompleted ? 'border-emerald-300' : 'border-slate-200'} rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 h-full relative`}>
        
        {isCompleted && (
          <div className="absolute top-4 right-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
        )}

        <div className="flex items-start justify-between mb-4 pr-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {title}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${colors.badge}`}>
                  {difficultyLabel}
                </span>
                {lesson.duration_minutes && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {lesson.duration_minutes} min
                  </div>
                )}
                {progress.reviewCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 bg-white/50 pr-2 py-1 rounded-full">
                    <RotateCcw className="w-3 h-3" />
                    {progress.reviewCount}
                  </div>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>

        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          {description}
        </p>

        {lesson.related_algorithm_ids && lesson.related_algorithm_ids.length > 0 && (
          <div className="pt-4 border-t border-slate-200/50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Related Algorithms: {lesson.related_algorithm_ids.length}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
