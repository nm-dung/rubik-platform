'use client';

/**
 * Lesson Form Component
 * Shared form for create/edit lesson
 */

import { useState } from 'react';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { showSuccess, showError } from '@/lib/toast';
import { Lesson, LessonDifficulty, LearningPath } from '@/lib/types';

interface LessonFormProps {
  initialData?: Lesson & { status?: 'draft' | 'published' };
  onSuccess?: () => void;
}

export function LessonForm({ initialData, onSuccess }: LessonFormProps) {
  const [form, setForm] = useState(initialData || {
    id: '',
    title_en: '',
    title_vi: '',
    description_en: '',
    description_vi: '',
    content_en: '',
    content_vi: '',
    difficulty: 'beginner' as LessonDifficulty,
    order: 0,
    duration_minutes: 15 as number | undefined,
    related_algorithm_ids: [] as string[],
    image_url: '',
    learning_path: 'advanced' as LearningPath,
    status: 'draft',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = form.id ? `/api/admin/lessons/${form.id}` : '/api/admin/lessons';
      const method = form.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save lesson');
      }

      showSuccess(`Lesson ${form.id ? 'updated' : 'created'} successfully`);
      onSuccess?.();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error saving lesson');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Lesson {form.id ? 'Edit' : 'Creator'}</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
          form.status === 'published' 
            ? 'bg-emerald-100 text-emerald-700' 
            : 'bg-amber-100 text-amber-700'
        }`}>
          {form.status === 'published' ? 'Published' : 'Draft'}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">English Title *</label>
          <input
            required
            value={form.title_en}
            onChange={(e) => setForm({ ...form, title_en: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Vietnamese Title *</label>
          <input
            required
            value={form.title_vi}
            onChange={(e) => setForm({ ...form, title_vi: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">English Description *</label>
          <textarea
            required
            value={form.description_en}
            onChange={(e) => setForm({ ...form, description_en: e.target.value })}
            rows={2}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Vietnamese Description *</label>
          <textarea
            required
            value={form.description_vi}
            onChange={(e) => setForm({ ...form, description_vi: e.target.value })}
            rows={2}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">English Content *</label>
        <textarea
          required
          value={form.content_en}
          onChange={(e) => setForm({ ...form, content_en: e.target.value })}
          rows={4}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Vietnamese Content *</label>
        <textarea
          required
          value={form.content_vi}
          onChange={(e) => setForm({ ...form, content_vi: e.target.value })}
          rows={4}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty *</label>
          <select
            required
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value as LessonDifficulty })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Learning Path *</label>
          <select
            required
            value={form.learning_path}
            onChange={(e) => setForm({ ...form, learning_path: e.target.value as LearningPath })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="beginner">Beginner (Linear)</option>
            <option value="advanced">Advanced (Self-directed)</option>
            <option value="both">Both Paths</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Order *</label>
          <input
            required
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
          <input
            type="number"
            value={form.duration_minutes ?? ''}
            onChange={(e) => setForm({ ...form, duration_minutes: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Related Algorithm IDs</label>
        <input
          type="text"
          value={Array.isArray(form.related_algorithm_ids) ? form.related_algorithm_ids.join(', ') : ''}
          onChange={(e) => setForm({ ...form, related_algorithm_ids: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="Comma separated IDs"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
          <ImageIcon className="h-4 w-4 text-slate-400" />
          <input
            type="url"
            value={form.image_url || ''}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="https://example.com/image.jpg"
            className="flex-1 border-0 outline-none text-sm"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.status === 'published'}
            onChange={(e) => setForm({ ...form, status: e.target.checked ? 'published' : 'draft' })}
            className="rounded"
          />
          <span className="text-sm font-medium text-slate-700">Publish immediately</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 px-6 py-2 text-sm font-semibold text-white transition-colors"
      >
        <Plus className="h-4 w-4" />
        {loading ? 'Saving...' : form.id ? 'Update Lesson' : 'Create Lesson'}
      </button>
    </form>
  );
}
