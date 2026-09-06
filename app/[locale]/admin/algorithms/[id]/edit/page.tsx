"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AlgorithmForm } from '@/components/admin/AlgorithmForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Algorithm } from '@/lib/types';
import { showError } from '@/lib/toast';

export default function EditAlgorithmPage({ params }: { params: { locale: string; id: string } }) {
  const locale = params.locale as 'en' | 'vi';
  const algorithmId = params.id;
  const router = useRouter();
  const [algorithm, setAlgorithm] = useState<(Algorithm & { status?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlgorithm() {
      try {
        const response = await fetch(`/api/admin/algorithms`);
        if (!response.ok) throw new Error('Failed to load');
        const algorithms = await response.json();
        const found = algorithms.find((a: Algorithm) => a.id === algorithmId);
        if (!found) {
          showError('Algorithm not found');
          router.push(`/${locale}/admin/algorithms`);
          return;
        }
        setAlgorithm(found);
      } catch (error) {
        showError('Failed to load algorithm');
      } finally {
        setLoading(false);
      }
    }
    loadAlgorithm();
  }, [algorithmId, locale, router]);

  if (loading) {
    return (
      <AdminGuard>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </AdminGuard>
    );
  }

  if (!algorithm) {
    return (
      <AdminGuard>
        <div className="text-center py-12">
          <p className="text-slate-600">Algorithm not found</p>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <Link
          href={`/${locale}/admin/algorithms`}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Algorithms
        </Link>

        <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-8">
          <AlgorithmForm
            initialData={algorithm}
            onSuccess={() => {
              router.push(`/${locale}/admin/algorithms`);
            }}
          />
        </div>
      </div>
    </AdminGuard>
  );
}
