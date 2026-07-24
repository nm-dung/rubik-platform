'use client';

/**
 * Lessons Management List Page
 */

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { Plus, Pencil, Trash2, ChevronLeft } from 'lucide-react';
import { Lesson } from '@/lib/types';
import { showSuccess, showError } from '@/lib/toast';

export default function LessonsListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;
  const [lessons, setLessons] = useState<(Lesson & { status?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'beginner' | 'intermediate' | 'advanced'>('all');

  useEffect(() => {
    loadLessons();
  }, []);

  async function loadLessons() {
    try {
      const response = await fetch('/api/admin/lessons');
      if (!response.ok) throw new Error('Failed to load lessons');
      const data = await response.json();
      setLessons(data);
    } catch (error) {
      showError('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      showSuccess('Lesson deleted');
      await loadLessons();
    } catch (error) {
      showError('Failed to delete lesson');
    }
  }

  const filtered = lessons.filter((l) => {
    if (filter === 'draft' || filter === 'published') return l.status === filter;
    if (['beginner', 'intermediate', 'advanced'].includes(filter)) return l.difficulty === filter;
    return true;
  });

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/admin`}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Manage Lessons</h1>
              <p className="text-slate-600 text-sm mt-1">{filtered.length} lessons total</p>
            </div>
          </div>
          <Link
            href={`/${locale}/admin/lessons/new`}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 px-6 py-2 text-sm font-semibold text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Lesson
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {(['draft', 'published'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f === 'draft' ? 'Drafts' : 'Published'}
            </button>
          ))}
          {(['beginner', 'intermediate', 'advanced'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white">
            <p className="text-slate-600">No lessons found</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Title</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Difficulty</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Order</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Duration</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lesson) => (
                    <tr key={lesson.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <div>
                          <p className="font-medium text-slate-900">{lesson.title_en}</p>
                          <p className="text-slate-500 text-xs">{lesson.title_vi}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-600 capitalize">{lesson.difficulty}</td>
                      <td className="px-6 py-3 text-slate-600">{lesson.order}</td>
                      <td className="px-6 py-3 text-slate-600">{lesson.duration_minutes ? `${lesson.duration_minutes}m` : '—'}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            lesson.status === 'published'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {lesson.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/${locale}/admin/lessons/${lesson.id}/edit`}
                            className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(lesson.id)}
                            className="rounded-full border border-red-200 p-2 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
