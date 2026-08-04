"use client";

import { useState, useEffect, useCallback } from "react";
import { Algorithm, AlgorithmPracticeStats } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { AlgorithmSelector } from "@/components/algorithms/AlgorithmSelector";
import { Play, ArrowRight, BarChart3, Clock, Trophy, RotateCcw, Square } from "lucide-react";

type TrainerState = 'selection' | 'training' | 'summary';

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

export default function AlgorithmTrainerPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = params;
  const [state, setState] = useState<TrainerState>('selection');
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<Algorithm | null>(null);
  const [sessionResults, setSessionResults] = useState<{ algorithmId: string; time: number }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [stats, setStats] = useState<Record<string, AlgorithmPracticeStats>>({});
  const [loading, setLoading] = useState(true);

  // Load algorithms
  useEffect(() => {
    async function loadAlgorithms() {
      try {
        if (!supabase) {
          setAlgorithms([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('algorithms')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAlgorithms(data || []);

        const userId = getUserId();
        const statsResponse = await fetch(`/api/algorithm-stats?userId=${userId}`);
        if (statsResponse.ok) {
          const statsData: AlgorithmPracticeStats[] = await statsResponse.json();
          const statsMap: Record<string, AlgorithmPracticeStats> = {};
          statsData.forEach(stat => {
            statsMap[stat.algorithm_id] = stat;
          });
          setStats(statsMap);
        }
      } catch (error) {
        console.error('Error loading algorithms:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAlgorithms();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && startTime !== null) {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  // Spacebar controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && state === 'training') {
        e.preventDefault();
        if (isRunning) {
          handleStopTimer();
        } else {
          handleStartTimer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, state]);

  const selectedAlgorithms = algorithms.filter(alg => selectedIds.includes(alg.id));

  const getRandomAlgorithm = useCallback(() => {
    if (selectedAlgorithms.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * selectedAlgorithms.length);
    return selectedAlgorithms[randomIndex];
  }, [selectedAlgorithms]);

  const handleStartTraining = () => {
    if (selectedIds.length === 0) return;
    setState('training');
    setCurrentAlgorithm(getRandomAlgorithm());
    setSessionResults([]);
  };

  const handleStartTimer = () => {
    setIsRunning(true);
    setStartTime(Date.now());
    setCurrentTime(0);
  };

  const handleStopTimer = () => {
    if (!isRunning || !currentAlgorithm) return;
    setIsRunning(false);
    const finalTime = startTime === null ? currentTime : Date.now() - startTime;

    // Save the result with the final time
    setSessionResults(results => [...results, { algorithmId: currentAlgorithm.id, time: finalTime }]);

    // Move to random next algorithm
    setCurrentAlgorithm(getRandomAlgorithm());

    // Reset timer for next start
    setCurrentTime(0);
    setStartTime(null);
  };

  const handleReset = () => {
    setIsRunning(false);
    setStartTime(null);
    setCurrentTime(0);
  };

  const handleBackToSelection = () => {
    setState('selection');
    setCurrentAlgorithm(null);
    setSessionResults([]);
    setIsRunning(false);
    setStartTime(null);
    setCurrentTime(0);
  };

  const handleEndSession = async () => {
    // Save session results to database
    try {
      if (sessionResults.length > 0) {
        const userId = getUserId();

        await fetch('/api/algorithm-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            results: sessionResults.map(r => ({
              algorithm_id: r.algorithmId,
              time_ms: r.time
            }))
          })
        });
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }

    setState('summary');
    setIsRunning(false);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${centiseconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="p-20 text-center font-bold text-slate-400">Loading...</div>;
  }

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-2">Algorithm Trainer</h1>
        <p className="text-sm sm:text-base text-slate-600">Practice algorithms with timed sessions and track your progress</p>
      </div>

      {state === 'selection' && (
        <>
          <AlgorithmSelector
            algorithms={algorithms}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleStartTraining}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              Start Training ({selectedIds.length} algorithms)
            </button>
          </div>
        </>
      )}

      {state === 'training' && currentAlgorithm && (
        <div className="space-y-4 sm:space-y-6">
          {/* Progress */}
          <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-600">
                Algorithms practiced: {sessionResults.length}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600">
                Avg: {sessionResults.length > 0 ? formatTime(sessionResults.reduce((sum, r) => sum + r.time, 0) / sessionResults.length) : '--'}
              </span>
            </div>
          </div>

          {/* Current Algorithm */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-4 sm:p-8">
            <div className="text-center mb-4 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">{currentAlgorithm.name_en}</h2>
              {stats[currentAlgorithm.id]?.practice_count > 0 && (
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-4">
                  Best: {formatTime(stats[currentAlgorithm.id].best_time_ms || 0)} ·
                  Avg: {formatTime(stats[currentAlgorithm.id].avg_time_ms || 0)} ·
                  {stats[currentAlgorithm.id].practice_count} practices
                </p>
              )}
              <div className="inline-block bg-slate-900 rounded-xl px-4 sm:px-6 py-3 sm:py-4">
                <div className="text-2xl sm:text-4xl font-black text-indigo-400 tracking-wider break-all">
                  {currentAlgorithm.notation}
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 mb-4 sm:mb-6 font-mono">
                {formatTime(currentTime)}
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                {!isRunning ? (
                  <button
                    onClick={handleStartTimer}
                    className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg text-sm sm:text-base"
                  >
                    <Play className="w-4 h-4 sm:w-6 sm:h-6" />
                    Start (Space)
                  </button>
                ) : (
                  <button
                    onClick={handleStopTimer}
                    className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg text-sm sm:text-base"
                  >
                    <Square className="w-4 h-4 sm:w-6 sm:h-6" />
                    Stop (Space)
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all text-sm sm:text-base"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
            <button
              onClick={handleBackToSelection}
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors text-center"
            >
              ← Back to Selection
            </button>
            <button
              onClick={handleEndSession}
              className="text-indigo-600 hover:text-indigo-900 font-medium transition-colors text-center"
            >
              End Session →
            </button>
          </div>
        </div>
      )}

      {state === 'summary' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-4 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full mb-4">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Training Complete!</h2>
              <p className="text-sm sm:text-base text-slate-600">Great job practicing {sessionResults.length} algorithms</p>
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-slate-50 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 mb-1">
                  {sessionResults.length}
                </div>
                <div className="text-xs sm:text-sm text-slate-600">Algorithms</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 mb-1">
                  {formatTime(sessionResults.reduce((sum, r) => sum + r.time, 0))}
                </div>
                <div className="text-xs sm:text-sm text-slate-600">Total Time</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-purple-600 mb-1">
                  {formatTime(sessionResults.reduce((sum, r) => sum + r.time, 0) / sessionResults.length)}
                </div>
                <div className="text-xs sm:text-sm text-slate-600">Average</div>
              </div>
            </div>

            {/* Individual Results */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-bold text-slate-900 mb-4 text-sm sm:text-base">Individual Results</h3>
              {sessionResults.map((result, index) => {
                const alg = algorithms.find(a => a.id === result.algorithmId);
                return (
                  <div key={`${result.algorithmId}-${index}`} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600 text-xs sm:text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{alg?.name_en}</div>
                        <div className="text-xs sm:text-sm text-slate-500 font-mono">{alg?.notation}</div>
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                      {formatTime(result.time)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleBackToSelection}
              className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all text-sm sm:text-base"
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
              New Session
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
