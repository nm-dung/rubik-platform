"use client";

import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Settings } from "lucide-react";

// We define the shape of the dictionary props we expect
type NavbarProps = {
  dict: {
    logo: string;
    learn: string;
    algorithms: string;
    timer?: string;
    trainer?: string;
    admin?: string;
  };
  locale: string;
};

export default function Navbar({ dict, locale }: NavbarProps) {
  const { user, profile, signOut, loading } = useAuth();
  const isVietnamese = locale === 'vi';

  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <Link href={`/${locale}`} className="text-xl font-bold tracking-tight text-indigo-600">
          {dict.logo}
        </Link>

        <nav className="flex items-center gap-6">
          <Link href={`/${locale}/learn`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            {dict.learn}
          </Link>
          <Link href={`/${locale}/algorithms`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            {dict.algorithms}
          </Link>

          <Link href={`/${locale}/trainer`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            {dict.trainer || "Trainer"}
          </Link>

          <Link href={`/${locale}/timer`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            {dict.timer || "Timer"}
          </Link>
          <Link href={`/${locale}/admin`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
            {dict.admin || "Admin"}
          </Link>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          <ThemeToggle />
          <LanguageSwitcher currentLocale={locale} />

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 hidden sm:block">
                    {profile?.username || user.email}
                  </span>
                  <Link
                    href={`/${locale}/settings`}
                    className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {isVietnamese ? "Cài đặt" : "Settings"}
                    </span>
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    {isVietnamese ? "Đăng xuất" : "Sign out"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    href={`/${locale}/auth/login`}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {isVietnamese ? "Đăng nhập" : "Sign in"}
                  </Link>
                  <Link
                    href={`/${locale}/auth/signup`}
                    className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {isVietnamese ? "Đăng ký" : "Sign up"}
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>

      </div>
    </header>
  );
}