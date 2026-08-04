"use client";

import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Settings, Menu, X } from "lucide-react";
import type { Dictionary } from "@/lib/dictionary";

// We define the shape of the dictionary props we expect
type NavbarProps = {
  dict: Dictionary['nav'];
  locale: string;
};

export default function Navbar({ dict, locale }: NavbarProps) {
  const { user, profile, signOut, loading } = useAuth();
  const isVietnamese = locale === 'vi';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <Link href={`/${locale}`} className="text-xl font-bold tracking-tight text-indigo-600">
          {dict.logo}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
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

          {!loading && user && (
            <Link href={`/${locale}/dashboard`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
              {locale === 'vi' ? "Thống kê" : "Dashboard"}
            </Link>
          )}
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

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col p-4 space-y-4">
            <Link
              href={`/${locale}/learn`}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.learn}
            </Link>
            <Link
              href={`/${locale}/algorithms`}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.algorithms}
            </Link>
            <Link
              href={`/${locale}/trainer`}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.trainer || "Trainer"}
            </Link>
            <Link
              href={`/${locale}/timer`}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.timer || "Timer"}
            </Link>
            {!loading && user && (
              <Link
                href={`/${locale}/dashboard`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {locale === 'vi' ? "Thống kê" : "Dashboard"}
              </Link>
            )}
            <Link
              href={`/${locale}/admin`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.admin || "Admin"}
            </Link>

            <div className="border-t border-gray-200 pt-4 flex items-center gap-4">
              <ThemeToggle />
              <LanguageSwitcher currentLocale={locale} />
            </div>

            {!loading && (
              <>
                {user ? (
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <span className="text-sm text-gray-600 block">
                      {profile?.username || user.email}
                    </span>
                    <Link
                      href={`/${locale}/settings`}
                      className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-2 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      {isVietnamese ? "Cài đặt" : "Settings"}
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors py-2 w-full text-left"
                    >
                      {isVietnamese ? "Đăng xuất" : "Sign out"}
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <Link
                      href={`/${locale}/auth/login`}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors block py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {isVietnamese ? "Đăng nhập" : "Sign in"}
                    </Link>
                    <Link
                      href={`/${locale}/auth/signup`}
                      className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors block text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {isVietnamese ? "Đăng ký" : "Sign up"}
                    </Link>
                  </div>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}