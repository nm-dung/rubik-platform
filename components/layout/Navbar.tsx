"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  
  // Helper function to check if a link is active
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <Link 
          href={`/${locale}`} 
          className="text-xl font-bold tracking-tight text-indigo-600 hover:scale-110 transition-transform duration-300"
        >
          {dict.logo}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href={`/${locale}/learn`} 
            className={`text-sm font-medium relative py-2 px-1 transition-all duration-300 hover:scale-110 ${
              isActive(`/${locale}/learn`) 
                ? 'text-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            {dict.learn}
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transition-all duration-300 ${
              isActive(`/${locale}/learn`) ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'
            }`} />
          </Link>
          <Link 
            href={`/${locale}/algorithms`} 
            className={`text-sm font-medium relative py-2 px-1 transition-all duration-300 hover:scale-110 ${
              isActive(`/${locale}/algorithms`) 
                ? 'text-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            {dict.algorithms}
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transition-all duration-300 ${
              isActive(`/${locale}/algorithms`) ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'
            }`} />
          </Link>

          <Link 
            href={`/${locale}/trainer`} 
            className={`text-sm font-medium relative py-2 px-1 transition-all duration-300 hover:scale-110 ${
              isActive(`/${locale}/trainer`) 
                ? 'text-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            {dict.trainer || "Trainer"}
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transition-all duration-300 ${
              isActive(`/${locale}/trainer`) ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'
            }`} />
          </Link>

          <Link 
            href={`/${locale}/timer`} 
            className={`text-sm font-medium relative py-2 px-1 transition-all duration-300 hover:scale-110 ${
              isActive(`/${locale}/timer`) 
                ? 'text-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            {dict.timer || "Timer"}
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transition-all duration-300 ${
              isActive(`/${locale}/timer`) ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'
            }`} />
          </Link>

          <Link 
            href={`/${locale}/community`} 
            className={`text-sm font-medium relative py-2 px-1 transition-all duration-300 hover:scale-110 ${
              isActive(`/${locale}/community`) 
                ? 'text-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            {dict.community || "Community"}
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transition-all duration-300 ${
              isActive(`/${locale}/community`) ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'
            }`} />
          </Link>

          {!loading && user && (
            <Link 
              href={`/${locale}/dashboard`} 
              className={`text-sm font-medium relative py-2 px-1 transition-all duration-300 hover:scale-110 ${
                isActive(`/${locale}/dashboard`) 
                  ? 'text-indigo-600' 
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              {locale === 'vi' ? "Thống kê" : "Dashboard"}
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transition-all duration-300 ${
                isActive(`/${locale}/dashboard`) ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'
              }`} />
            </Link>
          )}
          <Link 
            href={`/${locale}/admin`} 
            className={`text-sm font-medium relative py-2 px-1 transition-all duration-300 hover:scale-110 ${
              isActive(`/${locale}/admin`) 
                ? 'text-indigo-600' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            {dict.admin || "Admin"}
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transition-all duration-300 ${
              isActive(`/${locale}/admin`) ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'
            }`} />
          </Link>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          <ThemeToggle />
          <LanguageSwitcher currentLocale={locale} />

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 hidden sm:block">
                    {profile?.username || 'User'}
                  </span>
                  <Link
                    href={`/${locale}/settings`}
                    className={`text-sm font-medium transition-all duration-300 flex items-center gap-1 hover:scale-110 px-2 py-2 sm:px-0 sm:py-0 touch-manipulation active:scale-95 ${
                      isActive(`/${locale}/settings`) ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {isVietnamese ? "Cài đặt" : "Settings"}
                    </span>
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-sm font-medium text-red-600 hover:text-red-700 hover:scale-110 transition-all duration-300 px-2 py-2 sm:px-0 sm:py-0 touch-manipulation active:scale-95"
                  >
                    {isVietnamese ? "Đăng xuất" : "Sign out"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 sm:gap-4">
                  <Link
                    href={`/${locale}/auth/login`}
                    className={`text-sm font-medium transition-all duration-300 hover:scale-110 px-3 py-2 sm:px-0 sm:py-0 touch-manipulation active:scale-95 ${
                      isActive(`/${locale}/auth/login`) ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                    }`}
                  >
                    {isVietnamese ? "Đăng nhập" : "Sign in"}
                  </Link>
                  <Link
                    href={`/${locale}/auth/signup`}
                    className={`text-sm font-medium bg-indigo-600 text-white px-4 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-700 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 active:scale-95 touch-manipulation ${
                      isActive(`/${locale}/auth/signup`) ? 'bg-indigo-700' : ''
                    }`}
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
          className="md:hidden p-3 sm:p-4 rounded-lg hover:bg-gray-100 hover:scale-110 transition-all duration-300 touch-manipulation active:scale-95"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col p-3 sm:p-4 space-y-1 sm:space-y-2">
            <Link
              href={`/${locale}/learn`}
              className={`text-sm font-medium relative py-3 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-indigo-50 touch-manipulation active:scale-95 ${
                isActive(`/${locale}/learn`) 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.learn}
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-indigo-600 rounded-r-full transition-all duration-300 ${
                isActive(`/${locale}/learn`) ? 'h-8' : 'h-0 hover:h-6'
              }`} />
            </Link>
            <Link
              href={`/${locale}/algorithms`}
              className={`text-sm font-medium relative py-3 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-indigo-50 touch-manipulation active:scale-95 ${
                isActive(`/${locale}/algorithms`) 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.algorithms}
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-indigo-600 rounded-r-full transition-all duration-300 ${
                isActive(`/${locale}/algorithms`) ? 'h-8' : 'h-0 hover:h-6'
              }`} />
            </Link>
            <Link
              href={`/${locale}/trainer`}
              className={`text-sm font-medium relative py-3 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-indigo-50 touch-manipulation active:scale-95 ${
                isActive(`/${locale}/trainer`) 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.trainer || "Trainer"}
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-indigo-600 rounded-r-full transition-all duration-300 ${
                isActive(`/${locale}/trainer`) ? 'h-8' : 'h-0 hover:h-6'
              }`} />
            </Link>
            <Link
              href={`/${locale}/timer`}
              className={`text-sm font-medium relative py-3 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-indigo-50 touch-manipulation active:scale-95 ${
                isActive(`/${locale}/timer`) 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.timer || "Timer"}
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-indigo-600 rounded-r-full transition-all duration-300 ${
                isActive(`/${locale}/timer`) ? 'h-8' : 'h-0 hover:h-6'
              }`} />
            </Link>
            <Link
              href={`/${locale}/community`}
              className={`text-sm font-medium relative py-3 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-indigo-50 touch-manipulation active:scale-95 ${
                isActive(`/${locale}/community`) 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.community || "Community"}
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-indigo-600 rounded-r-full transition-all duration-300 ${
                isActive(`/${locale}/community`) ? 'h-8' : 'h-0 hover:h-6'
              }`} />
            </Link>
            {!loading && user && (
              <Link
                href={`/${locale}/dashboard`}
                className={`text-sm font-medium relative py-3 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-indigo-50 touch-manipulation active:scale-95 ${
                  isActive(`/${locale}/dashboard`) 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {locale === 'vi' ? "Thống kê" : "Dashboard"}
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-indigo-600 rounded-r-full transition-all duration-300 ${
                  isActive(`/${locale}/dashboard`) ? 'h-8' : 'h-0 hover:h-6'
                }`} />
              </Link>
            )}
            <Link
              href={`/${locale}/admin`}
              className={`text-sm font-medium relative py-3 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-indigo-50 touch-manipulation active:scale-95 ${
                isActive(`/${locale}/admin`) 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {dict.admin || "Admin"}
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-indigo-600 rounded-r-full transition-all duration-300 ${
                isActive(`/${locale}/admin`) ? 'h-8' : 'h-0 hover:h-6'
              }`} />
            </Link>

            <div className="border-t border-gray-200 pt-3 sm:pt-4 flex items-center gap-3 sm:gap-4">
              <ThemeToggle />
              <LanguageSwitcher currentLocale={locale} />
            </div>

            {!loading && (
              <>
                {user ? (
                  <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                    <span className="text-sm text-gray-600 block py-2">
                      {profile?.username || 'User'}
                    </span>
                    <Link
                      href={`/${locale}/settings`}
                      className={`text-sm font-medium transition-all duration-300 flex items-center gap-2 py-3 px-2 hover:scale-105 touch-manipulation active:scale-95 rounded-lg hover:bg-indigo-50 ${
                        isActive(`/${locale}/settings`) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-indigo-600'
                      }`}
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
                      className="text-sm font-medium text-red-600 hover:text-red-700 hover:scale-105 transition-all duration-300 py-3 px-2 touch-manipulation active:scale-95 rounded-lg hover:bg-red-50 w-full text-left"
                    >
                      {isVietnamese ? "Đăng xuất" : "Sign out"}
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                    <Link
                      href={`/${locale}/auth/login`}
                      className={`text-sm font-medium transition-all duration-300 block py-3 px-2 hover:scale-105 touch-manipulation active:scale-95 rounded-lg hover:bg-indigo-50 ${
                        isActive(`/${locale}/auth/login`) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {isVietnamese ? "Đăng nhập" : "Sign in"}
                    </Link>
                    <Link
                      href={`/${locale}/auth/signup`}
                      className={`text-sm font-medium bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 block text-center touch-manipulation active:scale-95 ${
                        isActive(`/${locale}/auth/signup`) ? 'bg-indigo-700' : ''
                      }`}
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