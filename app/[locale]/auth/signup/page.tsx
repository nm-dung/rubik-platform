"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function SignupPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const { signUp, user } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(`/${resolvedParams.locale}`);
    }
  }, [user, router, resolvedParams.locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.length < 3) {
      setError(resolvedParams.locale === 'vi' ? "Tên người dùng phải có ít nhất 3 ký tự" : "Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError(resolvedParams.locale === 'vi' ? "Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới" : "Username can only contain letters, numbers, and underscores");
      return;
    }

    if (password !== confirmPassword) {
      setError(resolvedParams.locale === 'vi' ? "Mật khẩu không khớp" : "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError(resolvedParams.locale === 'vi' ? "Mật khẩu phải có ít nhất 6 ký tự" : "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, username);

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      // Success - user may need to confirm email
      router.push(`/${resolvedParams.locale}/auth/login`);
    }
  };

  const isVietnamese = resolvedParams.locale === 'vi';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              {isVietnamese ? "Đăng ký" : "Sign Up"}
            </h1>
            <p className="text-slate-600">
              {isVietnamese 
                ? "Tạo tài khoản để bắt đầu học Rubik's Cube"
                : "Create an account to start learning Rubik's Cube"
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
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                {isVietnamese ? "Tên người dùng" : "Username"}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={isVietnamese ? "rubikmaster" : "rubikmaster"}
              />
            </div>

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
                minLength={6}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={isVietnamese ? "••••••••" : "••••••••"}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                {isVietnamese ? "Xác nhận mật khẩu" : "Confirm Password"}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
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
                  {isVietnamese ? "Đang đăng ký..." : "Signing up..."}
                </>
              ) : (
                isVietnamese ? "Đăng ký" : "Sign Up"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              {isVietnamese ? "Đã có tài khoản?" : "Already have an account?"}{" "}
              <Link
                href={`/${resolvedParams.locale}/auth/login`}
                className="text-indigo-600 font-semibold hover:text-indigo-700"
              >
                {isVietnamese ? "Đăng nhập" : "Sign in"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
