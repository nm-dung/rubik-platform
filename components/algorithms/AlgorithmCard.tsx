"use client";

import { useCubeStore } from "@/hooks/useCubeStore";
import { useEffect, useState } from "react";
import { AlgorithmPractice } from "./AlgorithmPractice";
import { AlgorithmPracticeSession, AlgorithmPracticeStats, Algorithm } from "@/lib/types";
import { History, Trash2, X } from "lucide-react";

// Helper function to get user ID
function getUserId(): string {
  if (typeof window === 'undefined') return '00000000-0000-0000-0000-000000000001';
  
  const session = localStorage.getItem('sb-rubik-platform-auth-token');
  if (session) {
    try {
      const parsed = JSON.parse(session);
      return parsed.user?.id || '00000000-0000-0000-0000-000000000001';
    } catch {
      return '00000000-0000-0000-0000-000000000001';
    }
  }
  
  return '00000000-0000-0000-0000-000000000001';
}

export default function AlgorithmCard({
  alg,
  locale = 'en',
  stats,
  onStatsChange,
}: {
  alg: Algorithm;
  locale?: string;
  stats?: AlgorithmPracticeStats;
  onStatsChange?: (algorithmId: string, stats: AlgorithmPracticeStats | null) => void;
}) {
  const setAlgorithm = useCubeStore((state) => state.setAlgorithm);

  const learnedAlgs = useCubeStore((state) => state.learnedAlgs);
  const toggleLearned = useCubeStore((state) => state.toggleLearned);

  const [mounted, setMounted] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<AlgorithmPracticeSession[]>([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const isLearned = mounted ? learnedAlgs.includes(alg.id) : false;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const loadHistory = async () => {
    setShowHistory(true);
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const userId = getUserId();
      const response = await fetch(
        `/api/algorithm-stats?userId=${userId}&algorithmId=${encodeURIComponent(alg.id)}`
      );
      if (!response.ok) throw new Error('Failed to load practice history');

      const data: { sessions: AlgorithmPracticeSession[] } = await response.json();
      setHistory(data.sessions || []);
      setSelectedSessionIds([]);
    } catch (error) {
      console.error('Error loading practice history:', error);
      setHistoryError('Unable to load practice history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteHistory = async (deleteAll: boolean) => {
    const idsToDelete = deleteAll ? [] : selectedSessionIds;
    if (!deleteAll && idsToDelete.length === 0) return;
    if (deleteAll && !window.confirm('Delete all practice times for this algorithm?')) return;

    setDeleting(true);
    setHistoryError(null);
    try {
      const userId = getUserId();
      const response = await fetch('/api/algorithm-stats', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          algorithmId: alg.id,
          sessionIds: idsToDelete,
          deleteAll,
        }),
      });
      if (!response.ok) throw new Error('Failed to delete practice history');

      const data: { stats: AlgorithmPracticeStats | null } = await response.json();
      onStatsChange?.(alg.id, data.stats);
      await loadHistory();
    } catch (error) {
      console.error('Error deleting practice history:', error);
      setHistoryError('Unable to delete practice history.');
    } finally {
      setDeleting(false);
    }
  };

  // Show practice mode overlay
  if (showPractice) {
    return (
      <div className="relative">
        <AlgorithmPractice
          notation={alg.notation}
          algorithmName={locale === 'vi' ? alg.name_vi : alg.name_en}
          onComplete={() => {
            setShowPractice(false);
            toggleLearned(alg.id);
          }}
        />
        <button
          onClick={() => setShowPractice(false)}
          className="mt-4 w-full py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
          ← Back to Algorithm
        </button>
      </div>
    );
  }

  return (
    <div className={`group relative flex flex-col gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-6 border rounded-lg sm:rounded-xl md:rounded-2xl bg-white hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 overflow-hidden touch-manipulation active:scale-95 ${
      isLearned ? 'border-emerald-400 bg-emerald-50/10' : 'border-slate-200 hover:border-indigo-300'
    }`}>
      
      {/* Animated gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="w-full h-20 sm:h-24 md:h-32 bg-slate-50 rounded-lg sm:rounded-xl flex-shrink-0 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:scale-105 group-hover:rotate-1 transition-all duration-300 relative z-10">
        {alg.image_url ? (
          <img src={alg.image_url} alt={alg.name_en} className="w-full h-full object-contain p-1 sm:p-2 mix-blend-multiply" />
        ) : (
          <div className="text-[8px] sm:text-[10px] font-bold text-slate-300 uppercase text-center p-1 sm:p-2">Pattern Image</div>
        )}
      </div>

      <div className="flex-grow flex flex-col relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="w-full">
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap">
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300">
                {locale === 'vi' ? alg.name_vi : alg.name_en}
              </h3>
              {isLearned && (
                <span className="text-emerald-500 bg-emerald-100 p-1 rounded-full animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
              <span className="text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded uppercase tracking-tighter border border-indigo-100 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                {alg.difficulty || alg.category}
              </span>
              {stats && stats.practice_count > 0 && (
                <span className="text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded uppercase tracking-tighter border border-emerald-100 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                  Avg: {formatTime(stats.avg_time_ms || 0)}s ({stats.practice_count}×)
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowPractice(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-700 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 active:scale-95 touch-manipulation"
            >
              <span>Practice</span>
            </button>

            <button
              onClick={() => toggleLearned(alg.id)}
              className={`p-1.5 sm:p-2 rounded-lg transition-all border hover:scale-110 active:scale-95 touch-manipulation ${
                isLearned
                  ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30'
                  : 'text-slate-400 bg-white border-slate-200 hover:border-emerald-400 hover:text-emerald-500 hover:shadow-md'
              }`}
              title="Mark as learned"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
        </div>

        <div className="mt-auto p-2 sm:p-3 md:p-4 bg-slate-900 rounded-lg sm:rounded-xl shadow-inner font-mono text-xs sm:text-sm md:text-lg text-indigo-300 tracking-widest overflow-x-auto whitespace-nowrap group-hover:bg-slate-800 group-hover:shadow-inner-lg transition-all duration-300 relative z-10">
          {alg.notation}
        </div>

        {stats && stats.practice_count > 0 && (
          <div className="mt-2 sm:mt-4">
            <button
              onClick={showHistory ? () => setShowHistory(false) : loadHistory}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors active:scale-95 touch-manipulation"
            >
              {showHistory ? <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              {showHistory ? 'Hide history' : `View history (${stats.practice_count})`}
            </button>

            {showHistory && (
              <div className="mt-2 sm:mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                    Select times to delete
                  </span>
                  <div className="flex gap-1.5 sm:gap-2">
                    <button
                      onClick={() => handleDeleteHistory(false)}
                      disabled={deleting || selectedSessionIds.length === 0}
                      className="flex items-center gap-1 rounded-lg bg-amber-100 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-amber-700 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 touch-manipulation"
                    >
                      <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Delete selected
                    </button>
                    <button
                      onClick={() => handleDeleteHistory(true)}
                      disabled={deleting || history.length === 0}
                      className="flex items-center gap-1 rounded-lg bg-red-100 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 touch-manipulation"
                    >
                      <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Delete all
                    </button>
                  </div>
                </div>

                {historyError && <p className="mb-2 sm:mb-3 text-xs sm:text-sm font-medium text-red-600">{historyError}</p>}
                {historyLoading ? (
                  <p className="py-2 sm:py-3 text-xs sm:text-sm text-slate-500">Loading history...</p>
                ) : history.length === 0 ? (
                  <p className="py-3 text-sm text-slate-500">No practice history.</p>
                ) : (
                  <div className="max-h-56 space-y-2 overflow-y-auto">
                    {history.map((session) => (
                      <label key={session.id} className="flex cursor-pointer items-center justify-between rounded-lg bg-white px-3 py-2 text-sm hover:bg-indigo-50">
                        <span className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedSessionIds.includes(session.id || '')}
                            onChange={() => {
                              if (!session.id) return;
                              setSelectedSessionIds((selected) => selected.includes(session.id!)
                                ? selected.filter((id) => id !== session.id)
                                : [...selected, session.id!]);
                            }}
                            className="h-4 w-4 accent-indigo-600"
                          />
                          <span className="font-mono font-bold text-slate-800">{formatTime(session.time_ms)}</span>
                        </span>
                        <span className="text-xs text-slate-400">
                          {session.timestamp ? new Date(session.timestamp).toLocaleString() : 'Unknown date'}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}