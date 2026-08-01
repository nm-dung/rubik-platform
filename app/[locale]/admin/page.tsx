'use client';

import { use } from 'react';
import Link from 'next/link';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { BookOpen, Boxes, FileText } from 'lucide-react';

export default function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale as 'en' | 'vi';

  const quickActions = [
    {
      title: 'Manage Algorithms',
      description: 'Create, edit, and delete cube algorithms',
      icon: Boxes,
      href: `/${locale}/admin/algorithms`,
      color: 'indigo',
    },
    {
      title: 'Manage Lessons',
      description: 'Create, edit, and delete learning lessons',
      icon: BookOpen,
      href: `/${locale}/admin/lessons`,
      color: 'emerald',
    },
    {
      title: 'Review Submissions',
      description: 'Review content submissions from coaches',
      icon: FileText,
      href: `/${locale}/admin/submissions`,
      color: 'amber',
    },
  ];

  return (
    <AdminGuard>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Admin Panel</h2>
          <p className="text-slate-600">
            Manage content, algorithms, and lessons for the Rubik's Learning Platform
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const bgColor = {
              indigo: 'bg-indigo-50 border-indigo-200',
              emerald: 'bg-emerald-50 border-emerald-200',
              amber: 'bg-amber-50 border-amber-200',
            }[action.color];

            const iconColor = {
              indigo: 'text-indigo-600',
              emerald: 'text-emerald-600',
              amber: 'text-amber-600',
            }[action.color];

            const buttonColor = {
              indigo: 'bg-indigo-600 hover:bg-indigo-700',
              emerald: 'bg-emerald-600 hover:bg-emerald-700',
              amber: 'bg-amber-600 hover:bg-amber-700',
            }[action.color];

            return (
              <Link
                key={action.href}
                href={action.href}
                className={`block rounded-2xl border ${bgColor} p-6 transition-all hover:shadow-lg`}
              >
                <Icon className={`h-8 w-8 ${iconColor} mb-3`} />
                <h3 className="font-bold text-slate-900 mb-1">{action.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{action.description}</p>
                <button
                  onClick={(e) => e.preventDefault()}
                  className={`text-sm font-semibold text-white px-4 py-2 rounded-full ${buttonColor} transition-colors`}
                >
                  Go
                </button>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
          <p className="text-sm text-slate-600">
            Activity logs will be displayed here. Currently, no recent activity.
          </p>
        </div>
      </div>
    </AdminGuard>
  );
}
