"use client";

import { use, useState, useEffect } from "react";
import { getDictionary } from "@/lib/dictionary";
import { Lesson, LessonDifficulty } from "@/lib/types";
import LessonCard from "@/components/lessons/LessonCard";
import { Lightbulb, Target, Zap } from "lucide-react";

type Dictionary = {
  learn: {
    title: string;
    description: string;
  };
  [key: string]: unknown;
};

export default function LearnPage({ params }: { params: Promise<{ locale: 'en' | 'vi' }> }) {
  const resolvedParams = use(params);
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [lessons, setLessons] = useState<Record<LessonDifficulty, Lesson[]>>({
    beginner: [],
    intermediate: [],
    advanced: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const d = await getDictionary(resolvedParams.locale);
        setDict(d);

        // Fetch lessons from API
        const response = await fetch('/api/lessons');
        if (!response.ok) throw new Error('Failed to fetch lessons');
        
        const lessonsData: Lesson[] = await response.json();
        
        // Group by difficulty
        const grouped: Record<LessonDifficulty, Lesson[]> = {
          beginner: lessonsData.filter(l => l.difficulty === 'beginner'),
          intermediate: lessonsData.filter(l => l.difficulty === 'intermediate'),
          advanced: lessonsData.filter(l => l.difficulty === 'advanced'),
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
        <h1 className="text-5xl font-black text-slate-900 mb-4">
          {dict.learn.title}
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl">
          Learn to solve the Rubik&apos;s Cube step-by-step with our interactive lessons. Progress from complete beginner to advanced speed cuber.
        </p>
      </section>

      {/* Beginner Path */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <Lightbulb className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">Beginner Path</h2>
            <p className="text-slate-600">Start from scratch with the Layer-by-Layer method</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.beginner.length > 0 ? (
            lessons.beginner.map((lesson) => (
              <LessonCard 
                key={lesson.id} 
                lesson={lesson} 
                locale={resolvedParams.locale}
              />
            ))
          ) : (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
              Coming soon...
            </div>
          )}
        </div>
      </section>

      {/* Intermediate Path */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">Intermediate Path</h2>
            <p className="text-slate-600">Master the CFOP method used by most speed cubers</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.intermediate.length > 0 ? (
            lessons.intermediate.map((lesson) => (
              <LessonCard 
                key={lesson.id} 
                lesson={lesson} 
                locale={resolvedParams.locale}
              />
            ))
          ) : (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
              Coming soon...
            </div>
          )}
        </div>
      </section>

      {/* Advanced Path */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">Advanced Path</h2>
            <p className="text-slate-600">Optimize your technique and explore alternative methods</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.advanced.length > 0 ? (
            lessons.advanced.map((lesson) => (
              <LessonCard 
                key={lesson.id} 
                lesson={lesson} 
                locale={resolvedParams.locale}
              />
            ))
          ) : (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
              Coming soon...
            </div>
          )}
        </div>
      </section>
    </main>
  );
}