'use client';

/**
 * Algorithm Form Component
 * Shared form for create/edit algorithm
 */

import { useState } from 'react';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { showSuccess, showError } from '@/lib/toast';
import { Algorithm } from '@/lib/types';

interface AlgorithmFormProps {
  initialData?: Algorithm & { status?: 'draft' | 'published' };
  onSuccess?: () => void;
}

export function AlgorithmForm({ initialData, onSuccess }: AlgorithmFormProps) {
  const [form, setForm] = useState(initialData || {
    id: '',
    name_en: '',
    name_vi: '',
    category: 'PLL',
    notation: '',
    difficulty: 1,
    image_url: '',
    alternate_notations: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = form.id ? `/api/admin/algorithms/${form.id}` : '/api/admin/algorithms';
      const method = form.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save algorithm');
      }

      showSuccess(`Algorithm ${form.id ? 'updated' : 'created'} successfully`);
      onSuccess?.();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error saving algorithm');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Algorithm {form.id ? 'Edit' : 'Creator'}</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
          form.status === 'published' 
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
        }`}>
          {form.status === 'published' ? 'Published' : 'Draft'}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">English Name *</label>
          <input
            required
            value={form.name_en}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
            placeholder="e.g., Sexy Move"
            className="w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vietnamese Name *</label>
          <input
            required
            value={form.name_vi}
            onChange={(e) => setForm({ ...form, name_vi: e.target.value })}
            placeholder="e.g., Nước Mỳ Pha"
            className="w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
          <select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Algorithm['category'] })}
            className="w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-white"
          >
            <option value="F2L">F2L - First 2 Layers</option>
            <option value="OLL">OLL - Orient Last Layer</option>
            <option value="PLL">PLL - Permute Last Layer</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notation *</label>
          <input
            required
            value={form.notation}
            onChange={(e) => setForm({ ...form, notation: e.target.value })}
            placeholder="e.g., M' U M U2 M' U M"
            className="w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Difficulty (1-10) *</label>
          <input
            required
            type="number"
            min="1"
            max="10"
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })}
            className="w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alternate Notations</label>
        <textarea
          value={form.alternate_notations}
          onChange={(e) => setForm({ ...form, alternate_notations: e.target.value })}
          placeholder="One per line"
          rows={3}
          className="w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2">
          <ImageIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="https://example.com/image.jpg"
            className="flex-1 border-0 outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
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
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Publish immediately</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-gray-600 px-6 py-2 text-sm font-semibold text-white transition-colors"
      >
        <Plus className="h-4 w-4" />
        {loading ? 'Saving...' : form.id ? 'Update Algorithm' : 'Create Algorithm'}
      </button>
    </form>
  );
}
