"use client";

/**
 * Algorithms Management List Page
 */

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { Plus, Pencil, Trash2, ChevronLeft } from 'lucide-react';
import { Algorithm } from '@/lib/types';
import { showSuccess, showError } from '@/lib/toast';

export default function AlgorithmsListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: routeLocale } = use(params);
  const locale = routeLocale as 'en' | 'vi';
  const [algorithms, setAlgorithms] = useState<(Algorithm & { status?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');


  useEffect(() => {
    loadAlgorithms();
  }, []);

  async function loadAlgorithms() {
    try {
      const response = await fetch('/api/admin/algorithms');
      if (!response.ok) throw new Error('Failed to load algorithms');
      const data = await response.json();
      setAlgorithms(data);
    } catch (error) {
      showError('Failed to load algorithms');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/algorithms/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      showSuccess('Algorithm deleted');
      await loadAlgorithms();
    } catch (error) {
      showError('Failed to delete algorithm');
    }
  }

  const filtered = algorithms.filter((a) => {
    if (filter === 'draft') return a.status === 'draft';
    if (filter === 'published') return a.status === 'published';
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
              <h1 className="text-3xl font-bold text-slate-900">Manage Algorithms</h1>
              <p className="text-slate-600 text-sm mt-1">{filtered.length} algorithms total</p>
            </div>
          </div>
          <Link
            href={`/${locale}/admin/algorithms/new`}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 px-6 py-2 text-sm font-semibold text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Algorithm
          </Link>
        </div>

        <div className="flex gap-2">
          {(['all', 'draft', 'published'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'draft' ? 'Drafts' : 'Published'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white">
            <p className="text-slate-600">No algorithms found</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Category</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Difficulty</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Notation</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((algo) => (
                    <tr key={algo.id} className="border-b border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-3">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{algo.name_en}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs">{algo.name_vi}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{algo.category}</td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{algo.difficulty}/10</td>
                      <td className="px-6 py-3 font-mono text-slate-600 dark:text-slate-300 text-xs">{algo.notation}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            algo.status === 'published'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {algo.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/${locale}/admin/algorithms/${algo.id}/edit`}
                            className="rounded-full border border-slate-200 dark:border-gray-600 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(algo.id)}
                            className="rounded-full border border-red-200 dark:border-red-800 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
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
