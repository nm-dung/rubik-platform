"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const { signIn, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(`/${resolvedParams.locale as 'en' | 'vi'}`);
    }
  }, [user, router, resolvedParams.locale as 'en' | 'vi']);

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

  const isVietnamese = (resolvedParams.locale as 'en' | 'vi') === 'vi';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              {isVietnamese ? "Đăng nhập" : "Sign In"}
            </h1>
            <p className="text-slate-600">
              {isVietnamese 
                ? "Chào mừng trở lại với Rubik's Learning Platform"
                : "Welcome back to Rubik's Learning Platform"
              }
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                {isVietnamese ? "Email" : "Email"}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={isVietnamese ? "email@example.com" : "email@example.com"}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                {isVietnamese ? "Mật khẩu" : "Password"}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={isVietnamese ? "••••••••" : "••••••••"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isVietnamese ? "Đang đăng nhập..." : "Signing in..."}
                </>
              ) : (
                isVietnamese ? "Đăng nhập" : "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              {isVietnamese ? "Chưa có tài khoản?" : "Don't have an account?"}{" "}
              <Link
                href={`/${resolvedParams.locale as 'en' | 'vi'}/auth/signup`}
                className="text-indigo-600 font-semibold hover:text-indigo-700"
              >
                {isVietnamese ? "Đăng ký" : "Sign up"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
