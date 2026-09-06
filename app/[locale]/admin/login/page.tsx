'use client';

import { FormEvent, use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LockKeyhole } from 'lucide-react';
import { showError, showSuccess } from '@/lib/toast';
import { getDictionary, type Dictionary } from '@/lib/dictionary';

export default function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [dict, setDict] = useState<Dictionary | null>(null);

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          router.replace(`/${locale}/admin`);
          return;
        }
      } catch {
        // Not logged in — show the form
      } finally {
        setCheckingSession(false);
      }
    }

    checkExistingSession();
  }, [locale, router]);

  useEffect(() => {
    async function loadDict() {
      const d = await getDictionary(locale as 'en' | 'vi');
      setDict(d);
    }
    loadDict();
  }, [locale]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || (dict?.admin?.invalid_credentials || 'Invalid email or password.'));
        return;
      }

      showSuccess(dict?.admin?.login_success || 'Logged in successfully.');
      router.push(`/${locale}/admin`);
      router.refresh();
    } catch {
      showError(dict?.admin?.login_error || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400" />
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{dict?.admin?.login_title || 'Admin Sign In'}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {dict?.admin?.login_subtitle || 'Sign in to manage lessons, algorithms, and content.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {dict?.admin?.email || 'Email'}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-gray-600 px-4 py-3 text-slate-900 dark:text-white outline-none transition-colors focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 bg-white dark:bg-gray-700"
              placeholder="coach@rubik.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {dict?.admin?.password || 'Password'}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-gray-600 px-4 py-3 text-slate-900 dark:text-white outline-none transition-colors focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 bg-white dark:bg-gray-700"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 dark:bg-indigo-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : (dict?.admin?.login_button || 'Sign In')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link href={`/${locale}`} className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
            {dict?.admin?.back_to_site || 'Back to home'}
          </Link>
        </p>
      </div>
    </main>
  );
}
