"use client";
import Link from 'next/link';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { BookOpen, Boxes, FileText } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import { getDictionary } from '@/lib/dictionary';

export default function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: routeLocale } = use(params);
  const locale = routeLocale as 'en' | 'vi';
  const [dict, setDict] = useState<any | null>(null);
  useEffect(() => {
    async function loadDict() {
      const d = await getDictionary(locale);
      setDict(d);
    }
    loadDict();
  }, [locale]);

  const quickActions = [
    {
      title: dict?.admin?.manage_algorithms || 'Manage Algorithms',
      description: dict?.admin?.manage_algorithms_description || 'Create, edit, and delete cube algorithms',
      icon: Boxes,
      href: `/${locale}/admin/algorithms`,
      color: 'indigo',
    },
    {
      title: dict?.admin?.manage_lessons || 'Manage Lessons',
      description: dict?.admin?.manage_lessons_description || 'Create, edit, and delete learning lessons',
      icon: BookOpen,
      href: `/${locale}/admin/lessons`,
      color: 'emerald',
    },
    {
      title: dict?.admin?.review_submissions || 'Review Submissions',
      description: dict?.admin?.review_submissions_description || 'Review content submissions from coaches',
      icon: FileText,
      href: `/${locale}/admin/submissions`,
      color: 'amber',
    },
  ];

  return (
    <AdminGuard>
      <div className="space-y-8 bg-white dark:bg-gray-900 min-h-screen p-4 sm:p-8">
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{dict?.admin?.dashboard_title || 'Welcome to Admin Panel'}</h2>
          <p className="text-slate-600 dark:text-slate-300">
            {dict?.admin?.manage_content_description || "Manage content, algorithms, and lessons for the Rubik's Learning Platform"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const bgColor = {
              indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
              emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
              amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
            }[action.color];

            const iconColor = {
              indigo: 'text-indigo-600 dark:text-indigo-400',
              emerald: 'text-emerald-600 dark:text-emerald-400',
              amber: 'text-amber-600 dark:text-amber-400',
            }[action.color];

            const buttonColor = {
              indigo: 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600',
              emerald: 'bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600',
              amber: 'bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-600',
            }[action.color];

            return (
              <Link
                key={action.href}
                href={action.href}
                className={`block rounded-2xl border ${bgColor} p-6 transition-all duration-300 hover:shadow-xl hover:shadow-${action.color}-500/20 hover:-translate-y-1 hover:scale-105 animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Icon className={`h-8 w-8 ${iconColor} mb-3 transition-transform duration-300 group-hover:scale-110`} />
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{action.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{action.description}</p>
                <button
                  onClick={(e) => e.preventDefault()}
                  className={`text-sm font-semibold text-white px-4 py-2 rounded-full ${buttonColor} transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-${action.color}-500/30`}
                >
                  {dict?.admin?.go || 'Go'}
                </button>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">{dict?.admin?.recent_activity || 'Recent Activity'}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {dict?.admin?.no_recent_activity || 'Activity logs will be displayed here. Currently, no recent activity.'}
          </p>
        </div>
      </div>
    </AdminGuard>
  );
}
