'use client';

/**
 * Submissions Review Page
 * Allows admins to review contribution requests from coaches
 */

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { ChevronLeft, Check, X, Eye, FileText } from 'lucide-react';
import { showSuccess, showError } from '@/lib/toast';

interface ContributionRequest {
  id: string;
  lesson_id: string;
  lesson_title: string;
  contribution_type: string;
  submitted_by: string;
  role: string;
  details: string;
  locale: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function SubmissionsReviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;
  const [submissions, setSubmissions] = useState<ContributionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<ContributionRequest | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    try {
      const response = await fetch('/api/admin/submissions');
      if (!response.ok) throw new Error('Failed to load submissions');
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      showError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(id: string, status: 'approved' | 'rejected') {
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      showSuccess(`Submission ${status}`);
      await loadSubmissions();
      setSelectedSubmission(null);
    } catch (error) {
      showError('Failed to update submission');
    }
  }

  const filtered = submissions.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/admin`}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Review Submissions</h1>
              <p className="text-slate-600 text-sm mt-1">
                {submissions.filter(s => s.status === 'pending').length} pending submissions
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No submissions found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((submission) => (
              <div
                key={submission.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{submission.lesson_title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          submission.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : submission.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p><span className="font-medium">Type:</span> {submission.contribution_type}</p>
                      <p><span className="font-medium">Submitted by:</span> {submission.submitted_by} ({submission.role})</p>
                      <p><span className="font-medium">Date:</span> {formatDate(submission.created_at)}</p>
                      <p><span className="font-medium">Locale:</span> {submission.locale.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {submission.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(submission.id, 'approved')}
                          className="p-2 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(submission.id, 'rejected')}
                          className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Contribution Details</h3>
                  <p className="text-sm text-slate-500">{selectedSubmission.lesson_title}</p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <span className="text-sm font-semibold text-slate-500 block mb-1">Contribution Type</span>
                  <p className="text-slate-900">{selectedSubmission.contribution_type}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-500 block mb-1">Submitted By</span>
                  <p className="text-slate-900">{selectedSubmission.submitted_by} ({selectedSubmission.role})</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-500 block mb-1">Details</span>
                  <p className="text-slate-900 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">{selectedSubmission.details}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>Locale: {selectedSubmission.locale.toUpperCase()}</span>
                  <span>•</span>
                  <span>Submitted: {formatDate(selectedSubmission.created_at)}</span>
                </div>
              </div>
              {selectedSubmission.status === 'pending' && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedSubmission.id, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedSubmission.id, 'approved')}
                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
