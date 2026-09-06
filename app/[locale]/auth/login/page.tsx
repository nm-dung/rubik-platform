"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getDictionary, type Dictionary } from "@/lib/dictionary";

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const { signIn, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dict, setDict] = useState<Dictionary | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(`/${resolvedParams.locale as 'en' | 'vi'}`);
    }
  }, [user, router, resolvedParams.locale as 'en' | 'vi']);

  // Load dictionary
  useEffect(() => {
    async function loadDict() {
      const d = await getDictionary(resolvedParams.locale as 'en' | 'vi');
      setDict(d);
    }
    loadDict();
  }, [resolvedParams.locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      router.push(`/${resolvedParams.locale as 'en' | 'vi'}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
              {dict?.auth?.login_title || 'Sign In'}
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              {dict?.auth?.login_subtitle || 'Welcome back to Rubik\'s Learning Platform'}
            </p>
          </div>

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {dict?.auth?.email || 'Email'}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm text-slate-900 dark:text-white"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {dict?.auth?.password || 'Password'}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-sm text-slate-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  {dict?.auth?.login_button || 'Sign In'}...
                </>
              ) : (
                dict?.auth?.login_button || 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sm text-slate-600">
              {dict?.auth?.no_account || "Don't have an account?"}{" "}
              <Link
                href={`/${resolvedParams.locale as 'en' | 'vi'}/auth/signup`}
                className="text-indigo-600 font-semibold hover:text-indigo-700"
              >
                {dict?.auth?.sign_up || 'Sign up'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
