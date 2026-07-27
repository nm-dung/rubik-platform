"use client";

import { useState, useEffect } from "react";
import { Clock, Trash2, X, AlertTriangle } from "lucide-react";
import type { LessonReviewHistory } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewHistoryModalProps {
  show: boolean;
  lessonId: string;
  locale: "en" | "vi";
  onClose: () => void;
  onReviewDeleted: () => void;
}

// Temporary user ID fallback
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';

function getUserId(): string {
  if (typeof window === 'undefined') return TEMP_USER_ID;
  
  const session = localStorage.getItem('sb-rubik-platform-auth-token');
  if (session) {
    try {
      const parsed = JSON.parse(session);
      return parsed.user?.id || TEMP_USER_ID;
    } catch {
      return TEMP_USER_ID;
    }
  }
  
  return TEMP_USER_ID;
}

export function ReviewHistoryModal({ show, lessonId, locale, onClose, onReviewDeleted }: ReviewHistoryModalProps) {
  const [reviews, setReviews] = useState<LessonReviewHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (show) {
      loadReviewHistory();
    }
  }, [show, lessonId]);

  async function loadReviewHistory() {
    setLoading(true);
    const userId = getUserId();
    try {
      const response = await fetch(`/api/lesson-review-history?userId=${userId}&lessonId=${lessonId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error loading review history:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteReview(id: string) {
    setDeleting(id);
    const userId = getUserId();
    try {
      const response = await fetch(`/api/lesson-review-history?userId=${userId}&lessonId=${lessonId}&id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setReviews(reviews.filter(r => r.id !== id));
        onReviewDeleted();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setDeleting(null);
    }
  }

  async function deleteAllReviews() {
    if (!confirm(locale === 'vi' ? 'Bạn có chắc muốn xóa tất cả lịch sử ôn tập?' : 'Are you sure you want to delete all review history?')) {
      return;
    }
    
    setDeleting('all');
    const userId = getUserId();
    try {
      const response = await fetch(`/api/lesson-review-history?userId=${userId}&lessonId=${lessonId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setReviews([]);
        onReviewDeleted();
      }
    } catch (error) {
      console.error('Error deleting all reviews:', error);
    } finally {
      setDeleting(null);
    }
  }

  if (!show) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {locale === 'vi' ? 'Lịch sử ôn tập' : 'Review History'}
            </h3>
            <p className="text-sm text-slate-500">
              {locale === 'vi' ? `${reviews.length} lần ôn tập` : `${reviews.length} review attempts`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{locale === 'vi' ? 'Chưa có lịch sử ôn tập' : 'No review history yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review, index) => (
                <div
                  key={review.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {reviews.length - index}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {formatDate(review.reviewed_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReview(review.id)}
                    disabled={deleting === review.id}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title={locale === 'vi' ? 'Xóa' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <button
              onClick={deleteAllReviews}
              disabled={deleting === 'all'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm disabled:opacity-50"
            >
              <AlertTriangle className="w-4 h-4" />
              {deleting === 'all'
                ? (locale === 'vi' ? 'Đang xóa...' : 'Deleting...')
                : (locale === 'vi' ? 'Xóa tất cả lịch sử' : 'Delete all history')
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
