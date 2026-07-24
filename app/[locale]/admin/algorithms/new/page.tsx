'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AlgorithmForm } from '@/components/admin/AlgorithmForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewAlgorithmPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;
  const router = useRouter();

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
            onSuccess={() => {
              router.push(`/${locale}/admin/algorithms`);
            }}
          />
        </div>
      </div>
    </AdminGuard>
  );
}
