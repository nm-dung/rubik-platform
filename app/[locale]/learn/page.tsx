"use client";

import { use, useState, useEffect } from "react";
import { getDictionary } from "@/lib/dictionary";
import { Lesson, LearningPath } from "@/lib/types";
import LessonCard from "@/components/lessons/LessonCard";
import { Lightbulb, Zap } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";

type Dictionary = {
  learn: {
    title: string;
    description: string;
  };
  [key: string]: unknown;
};

export default function LearnPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
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
        const d = await getDictionary(resolvedParams.locale);
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
  }, [resolvedParams.locale]);

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
    return <div className="p-20 text-center font-bold text-slate-400">Loading...</div>;
  }

  if (error) {
    return (
      <main className="max-w-5xl mx-auto p-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-8">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-5xl font-black text-slate-900 mb-4">
              {dict.learn.title}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl">
              Choose your learning path. Start from zero as a complete beginner, or improve specific skills if you already know the basics.
            </p>
          </div>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={resolvedParams.locale === 'vi' ? 'Tìm kiếm bài học...' : 'Search lessons...'}
            className="w-full sm:w-64"
          />
        </div>
      </section>

      {/* Beginner Path - Structured, Linear */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <Lightbulb className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">Beginner Path</h2>
            <p className="text-slate-600">Complete beginner? Start here. Step-by-step lessons to your first solve.</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-green-800">
            <strong>Linear progression:</strong> Complete lessons in order. Each lesson builds on the previous one.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.beginner.length > 0 ? (
            filteredLessons.beginner
              .sort((a, b) => a.order - b.order)
              .map((lesson, index) => (
                <div key={lesson.id} className="relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
                    {index + 1}
                  </div>
                  <LessonCard
                    lesson={lesson}
                    locale={resolvedParams.locale}
                  />
                </div>
              ))
          ) : (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
              {searchQuery ? 'No lessons found matching your search.' : 'Beginner lessons coming soon...'}
            </div>
          )}
        </div>
      </section>

      {/* Advanced Path - Self-Directed */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">Advanced Path</h2>
            <p className="text-slate-600">Already know the basics? Choose lessons to improve specific skills.</p>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-purple-800">
            <strong>Self-directed:</strong> Choose any lesson. Focus on CFOP, F2L, OLL, PLL, or advanced techniques.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.advanced.length > 0 ? (
            filteredLessons.advanced
              .sort((a, b) => a.order - b.order)
              .map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  locale={resolvedParams.locale}
                />
              ))
          ) : (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
              {searchQuery ? 'No lessons found matching your search.' : 'Advanced lessons coming soon...'}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}