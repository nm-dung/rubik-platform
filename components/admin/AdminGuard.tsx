'use client';

/**
 * Admin Auth Guard Component
 * Protects admin pages and shows loading/unauthorized states
 */

import { useEffect, ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth';
import { LogOut } from 'lucide-react';
import { getDictionary } from '@/lib/dictionary';

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const [dict, setDict] = useState<any | null>(null);

  useEffect(() => {
    async function loadDict() {
      const d = await getDictionary(locale as 'en' | 'vi');
      setDict(d);
    }
    loadDict();
  }, [locale]);

  useEffect(() => {
    if (!loading && !user.authenticated) {
      router.push(`/${locale}/admin/login`);
    }
  }, [loading, user.authenticated, locale, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">{dict?.admin?.loading || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!user.authenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{dict?.admin?.dashboard_title || 'Admin Dashboard'}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-gray-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {dict?.admin?.logout || 'Logout'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">{children}</div>
      </div>
    </main>
  );
}

export function AdminLoadingState() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        <p className="mt-4 text-slate-600">Loading...</p>
      </div>
    </div>
  );
}
