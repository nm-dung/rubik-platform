"use client";

import { useState, useEffect, use } from "react";
import { getDictionary, type Dictionary } from "@/lib/dictionary";
import { Lesson, LearningPath } from "@/lib/types";
import LessonCard from "@/components/lessons/LessonCard";
import { Lightbulb, Zap } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";

export default function LearnPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale as 'en' | 'vi';
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [lessons, setLessons] = useState<Record<LearningPath, Lesson[]>>({
    beginner: [],
    advanced: [],
    both: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const d = await getDictionary(locale);
        setDict(d);

        // Fetch lessons from API
        const response = await fetch('/api/lessons');
        if (!response.ok) throw new Error('Failed to fetch lessons');

        const lessonsData: Lesson[] = await response.json();

        // Group by learning path
        const grouped: Record<LearningPath, Lesson[]> = {
          beginner: lessonsData.filter(l => l.learning_path === 'beginner'),
          advanced: lessonsData.filter(l => l.learning_path === 'advanced'),
          both: lessonsData.filter(l => l.learning_path === 'both'),
        };

        setLessons(grouped);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lessons');
        console.error('Error loading lessons:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [locale]);

  // Filter lessons based on search query
  const filteredLessons = {
    beginner: lessons.beginner.filter(lesson => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        lesson.title_en.toLowerCase().includes(query) ||
        lesson.title_vi.toLowerCase().includes(query) ||
        lesson.description_en.toLowerCase().includes(query) ||
        lesson.description_vi.toLowerCase().includes(query)
      );
    }),
    advanced: lessons.advanced.filter(lesson => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        lesson.title_en.toLowerCase().includes(query) ||
        lesson.title_vi.toLowerCase().includes(query) ||
        lesson.description_en.toLowerCase().includes(query) ||
        lesson.description_vi.toLowerCase().includes(query)
      );
    }),
    both: lessons.both.filter(lesson => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        lesson.title_en.toLowerCase().includes(query) ||
        lesson.title_vi.toLowerCase().includes(query) ||
        lesson.description_en.toLowerCase().includes(query) ||
        lesson.description_vi.toLowerCase().includes(query)
      );
    }),
  };

  if (loading || !dict) {
    return <div className="p-20 text-center font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-gray-900 min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <main className="max-w-5xl mx-auto p-8 bg-white dark:bg-gray-900 min-h-screen">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-8 bg-white dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="mb-8 sm:mb-16">
        <div className="flex flex-col gap-4 mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-2 sm:mb-4">
              {dict.learn.title}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
              {dict.learn.subtitle}
            </p>
          </div>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={dict.learn.search_placeholder}
            className="w-full sm:w-64"
          />
        </div>
      </section>

      {/* Beginner Path - Structured, Linear */}
      <section className="mb-8 sm:mb-16">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{dict.learn.beginner_path}</h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{dict.learn.beginner_description}</p>
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-400">
            {dict.learn.linear_progression}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredLessons.beginner.length > 0 ? (
            filteredLessons.beginner
              .sort((a, b) => a.order - b.order)
              .map((lesson, index) => (
                <div key={lesson.id} className="relative">
                  <div className="absolute -top-2 sm:-top-3 -left-2 sm:-left-3 w-6 h-6 sm:w-8 sm:h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm z-10">
                    {index + 1}
                  </div>
                  <LessonCard
                    lesson={lesson}
                    locale={locale}
                  />
                </div>
              ))
          ) : (
            <div className="col-span-full p-6 sm:p-12 text-center border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-xl text-slate-400 dark:text-slate-500">
              {searchQuery ? dict.learn.no_lessons_found : dict.learn.no_beginner_lessons}
            </div>
          )}
        </div>
      </section>

      {/* Advanced Path - Self-Directed */}
      <section>
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{dict.learn.advanced_path}</h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{dict.learn.advanced_description}</p>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-purple-800 dark:text-purple-400">
            {dict.learn.self_directed}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredLessons.advanced.length > 0 ? (
            filteredLessons.advanced
              .sort((a, b) => a.order - b.order)
              .map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  locale={locale}
                />
              ))
          ) : (
            <div className="col-span-full p-6 sm:p-12 text-center border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-xl text-slate-400 dark:text-slate-500">
              {searchQuery ? dict.learn.no_lessons_found : dict.learn.no_advanced_lessons}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}