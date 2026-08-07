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
      <div className={`${colors.bg} border-2 ${isCompleted ? 'border-emerald-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 h-full relative overflow-hidden`}>
        
        {/* Animated gradient background on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {isCompleted && (
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 animate-pulse">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          </div>
        )}

        <div className="flex items-start justify-between mb-3 sm:mb-4 pr-6 sm:pr-8 relative z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-white rounded-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300">
                {title}
              </h3>
              <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                <span className={`inline-block px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider ${colors.badge} group-hover:scale-105 transition-transform duration-300`}>
                  {difficultyLabel}
                </span>
                {lesson.duration_minutes && (
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 group-hover:text-indigo-600 transition-colors">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {lesson.duration_minutes} min
                  </div>
                )}
                {progress.reviewCount > 0 && (
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 bg-white/50 pr-1.5 sm:pr-2 py-0.5 sm:py-1 rounded-full group-hover:bg-white group-hover:scale-105 transition-all duration-300">
                    <RotateCcw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {progress.reviewCount}
                  </div>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-2 group-hover:scale-125 transition-all duration-300 flex-shrink-0" />
        </div>

        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 relative z-10 group-hover:text-slate-800 transition-colors">
          {description}
        </p>

        {lesson.related_algorithm_ids && lesson.related_algorithm_ids.length > 0 && (
          <div className="pt-3 sm:pt-4 border-t border-slate-200/50 relative z-10">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-2 group-hover:text-indigo-600 transition-colors">
              Related Algorithms: {lesson.related_algorithm_ids.length}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
