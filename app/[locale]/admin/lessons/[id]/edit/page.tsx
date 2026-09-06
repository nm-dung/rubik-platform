"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { LessonForm } from '@/components/admin/LessonForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Lesson } from '@/lib/types';
import { showError } from '@/lib/toast';

export default function EditLessonPage({ params }: { params: { locale: string; id: string } }) {
  const locale = params.locale as 'en' | 'vi';
  const lessonId = params.id;
  const router = useRouter();
  const [lesson, setLesson] = useState<(Lesson & { status?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLesson() {
      try {
        const response = await fetch(`/api/admin/lessons`);
        if (!response.ok) throw new Error('Failed to load');
        const lessons = await response.json();
        const found = lessons.find((l: Lesson) => l.id === lessonId);
        if (!found) {
          showError('Lesson not found');
          router.push(`/${locale}/admin/lessons`);
          return;
        }
        setLesson(found);
      } catch (error) {
        showError('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [lessonId, locale, router]);

  if (loading) {
    return (
      <AdminGuard>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      </AdminGuard>
    );
  }

  if (!lesson) {
    return (
      <AdminGuard>
        <div className="text-center py-12">
          <p className="text-slate-600">Lesson not found</p>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <Link
          href={`/${locale}/admin/lessons`}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Lessons
        </Link>

        <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-8">
          <LessonForm
            initialData={lesson}
            onSuccess={() => {
              router.push(`/${locale}/admin/lessons`);
            }}
          />
        </div>
      </div>
    </AdminGuard>
  );
}
