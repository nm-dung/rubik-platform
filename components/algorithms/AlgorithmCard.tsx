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
    <div className={`group relative flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 border rounded-xl sm:rounded-2xl bg-white hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 overflow-hidden ${
      isLearned ? 'border-emerald-400 bg-emerald-50/10' : 'border-slate-200 hover:border-indigo-300'
    }`}>
      
      {/* Animated gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="w-full h-24 sm:h-32 bg-slate-50 rounded-lg sm:rounded-xl flex-shrink-0 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:scale-105 group-hover:rotate-1 transition-all duration-300 relative z-10">
        {alg.image_url ? (
          <img src={alg.image_url} alt={alg.name_en} className="w-full h-full object-contain p-2 mix-blend-multiply" />
        ) : (
          <div className="text-[10px] font-bold text-slate-300 uppercase text-center p-2">Pattern Image</div>
        )}
      </div>

      <div className="flex-grow flex flex-col relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <div className="w-full">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300">
                {locale === 'vi' ? alg.name_vi : alg.name_en}
              </h3>
              {isLearned && (
                <span className="text-emerald-500 bg-emerald-100 p-1 rounded-full animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded uppercase tracking-tighter border border-indigo-100 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                {alg.difficulty || alg.category}
              </span>
              {stats && stats.practice_count > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded uppercase tracking-tighter border border-emerald-100 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                  Avg: {formatTime(stats.avg_time_ms || 0)}s ({stats.practice_count}×)
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowPractice(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-700 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 active:scale-95"
            >
              <span>Practice</span>
            </button>

            <button
              onClick={() => toggleLearned(alg.id)}
              className={`p-2 rounded-lg transition-all border hover:scale-110 ${
                isLearned
                  ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30'
                  : 'text-slate-400 bg-white border-slate-200 hover:border-emerald-400 hover:text-emerald-500 hover:shadow-md'
              }`}
              title="Mark as learned"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
        </div>

        <div className="mt-auto p-3 sm:p-4 bg-slate-900 rounded-lg sm:rounded-xl shadow-inner font-mono text-sm sm:text-lg text-indigo-300 tracking-widest overflow-x-auto whitespace-nowrap group-hover:bg-slate-800 group-hover:shadow-inner-lg transition-all duration-300 relative z-10">
          {alg.notation}
        </div>

        {stats && stats.practice_count > 0 && (
          <div className="mt-4">
            <button
              onClick={showHistory ? () => setShowHistory(false) : loadHistory}
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              {showHistory ? <X className="w-4 h-4" /> : <History className="w-4 h-4" />}
              {showHistory ? 'Hide history' : `View history (${stats.practice_count})`}
            </button>

            {showHistory && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Select times to delete
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteHistory(false)}
                      disabled={deleting || selectedSessionIds.length === 0}
                      className="flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete selected
                    </button>
                    <button
                      onClick={() => handleDeleteHistory(true)}
                      disabled={deleting || history.length === 0}
                      className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete all
                    </button>
                  </div>
                </div>

                {historyError && <p className="mb-3 text-sm font-medium text-red-600">{historyError}</p>}
                {historyLoading ? (
                  <p className="py-3 text-sm text-slate-500">Loading history...</p>
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