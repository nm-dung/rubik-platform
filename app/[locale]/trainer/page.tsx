"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { use } from "react";
import { useSearchParams } from "next/navigation";
import { Algorithm, AlgorithmPracticeStats } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { AlgorithmSelector } from "@/components/algorithms/AlgorithmSelector";
import { Play, ArrowRight, BarChart3, Clock, Trophy, RotateCcw, Square } from "lucide-react";
import { getDictionary, type Dictionary } from "@/lib/dictionary";
import { useCubeStore } from "@/hooks/useCubeStore";

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
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const algorithmId = searchParams.get('algorithmId');
  
  const [state, setState] = useState<TrainerState>('selection');
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<Algorithm | null>(null);
  const [sessionResults, setSessionResults] = useState<{ algorithmId: string; time: number }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [lastCompletedTime, setLastCompletedTime] = useState(0);
  const [stats, setStats] = useState<Record<string, AlgorithmPracticeStats>>({});
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [loadSucceeded, setLoadSucceeded] = useState(false);
  const [dict, setDict] = useState<Dictionary | null>(null);

  const preferredNotations = useCubeStore((state) => state.preferredNotations);

  const readyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionSaveStartedRef = useRef(false);

  // Load algorithms
  useEffect(() => {
    let isMounted = true;
    
    async function loadAlgorithms() {
      try {
        console.log('Loading algorithms...');
        if (!supabase) {
          console.log('Supabase not configured');
          if (isMounted) {
            setAlgorithms([]);
            setLoadingError('Supabase not configured');
            setLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from('algorithms')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Algorithms loaded:', data?.length || 0);
        if (isMounted) {
          setAlgorithms(data || []);
          setLoadSucceeded(true);
        }

        const userId = getUserId();
        console.log('Loading stats for user:', userId);
        const statsResponse = await fetch(`/api/algorithm-stats?userId=${userId}`);
        if (statsResponse.ok) {
          const statsData: AlgorithmPracticeStats[] = await statsResponse.json();
          const statsMap: Record<string, AlgorithmPracticeStats> = {};
          statsData.forEach(stat => {
            statsMap[stat.algorithm_id] = stat;
          });
          if (isMounted) {
            setStats(statsMap);
          }
          console.log('Stats loaded:', Object.keys(statsMap).length);
        } else {
          console.log('Stats API failed:', statsResponse.status);
        }
      } catch (error) {
        console.error('Error loading algorithms:', error);
        if (isMounted) {
          setAlgorithms([]);
          setLoadingError(error instanceof Error ? error.message : 'Failed to load algorithms');
          setLoading(false);
        }
      } finally {
        if (isMounted) {
          console.log('Loading complete');
          setLoading(false);
        }
      }
    }
    
    loadAlgorithms();
    
    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted && !loadSucceeded) {
        console.log('Loading timeout reached, forcing load complete');
        setLoading(false);
        setLoadingError('Loading timeout - check your network connection');
      }
    }, 30000); // 30 second timeout
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  // Handle algorithm from URL
  useEffect(() => {
    if (algorithmId && algorithms.length > 0 && state === 'selection') {
      const algorithm = algorithms.find(alg => alg.id === algorithmId);
      if (algorithm) {
        setSelectedIds([algorithmId]);
        setCurrentAlgorithm(algorithm);
        setState('training');
        setSessionResults([]);
        setIsReady(false);
        setIsRunning(false);
        setStartTime(null);
        setCurrentTime(0);
        setLastCompletedTime(0);
      }
    }
  }, [algorithmId, algorithms, state]);

  // Load dictionary
  useEffect(() => {
    async function loadDict() {
      const locale = resolvedParams.locale as 'en' | 'vi';
      const d = await getDictionary(locale);
      setDict(d);
    }
    loadDict();
  }, [resolvedParams.locale]);

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

  const selectedAlgorithms = algorithms.filter(alg => selectedIds.includes(alg.id));

  const getRandomAlgorithm = useCallback(() => {
    console.log('getRandomAlgorithm called, selectedIds:', selectedIds, 'algorithms length:', algorithms.length, 'selectedAlgorithms length:', selectedAlgorithms.length);
    if (selectedAlgorithms.length === 0) {
      console.warn('No algorithms selected, cannot get random algorithm');
      return null;
    }
    // When practicing with 1 algorithm, return the same one (expected behavior)
    // When practicing with multiple, return a random one
    const randomIndex = Math.floor(Math.random() * selectedAlgorithms.length);
    const algorithm = selectedAlgorithms[randomIndex];
    console.log('Returning algorithm:', algorithm?.name_en);
    return algorithm;
  }, [selectedAlgorithms, selectedIds, algorithms]);

  const handleStartTraining = () => {
    if (selectedIds.length === 0) return;
    sessionSaveStartedRef.current = false;
    setState('training');
    setCurrentAlgorithm(getRandomAlgorithm());
    setSessionResults([]);
    setIsReady(false);
    setIsRunning(false);
    setStartTime(null);
    setCurrentTime(0);
    setLastCompletedTime(0);
  };

  const handleReset = () => {
    setIsRunning(false);
    setStartTime(null);
    setCurrentTime(0);
    setLastCompletedTime(0);
    setIsReady(false);
  };

  // Spacebar controls with CSTimer-style hold-to-release logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && state === 'training' && !isRunning) {
        e.preventDefault();
        
        // Clear any existing timeouts
        if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
        
        // Set ready state after holding for 100ms
        readyTimeoutRef.current = setTimeout(() => {
          setIsReady(true);
        }, 100);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && state === 'training') {
        e.preventDefault();
        
        // Clear timeout
        if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
        
        if (isReady && !isRunning) {
          // Start timer when releasing space after being ready
          setIsRunning(true);
          setStartTime(Date.now());
          setCurrentTime(0);
          setLastCompletedTime(0);
          setIsReady(false);
        } else if (isRunning) {
          // Stop timer when pressing space while running
          setIsRunning(false);
          const finalTime = startTime === null ? currentTime : Date.now() - startTime;
          console.log('Final time calculated:', finalTime, 'startTime:', startTime, 'currentTime:', currentTime);
          setLastCompletedTime(finalTime);
          setCurrentTime(finalTime);
          setStartTime(null);
          
          if (currentAlgorithm) {
            console.log('Completed solve for:', currentAlgorithm.name_en, 'time:', finalTime);
            const solveResult = { algorithmId: currentAlgorithm.id, time: finalTime };
            console.log('Adding to sessionResults:', solveResult);
            setSessionResults(results => {
              const newResults = [...results, solveResult];
              console.log('Updated sessionResults:', newResults);
              return newResults;
            });
            const nextAlgorithm = getRandomAlgorithm();
            console.log('Next algorithm:', nextAlgorithm?.name_en);
            if (nextAlgorithm) {
              setCurrentAlgorithm(nextAlgorithm);
            } else {
              console.error('Failed to get next algorithm, stopping training');
              setState('selection');
            }
          }
        } else {
          // Reset ready state if released before ready
          setIsReady(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
    };
  }, [state, isRunning, isReady, startTime, currentTime, currentAlgorithm, getRandomAlgorithm]);

  const handleBackToSelection = () => {
    setState('selection');
    setCurrentAlgorithm(null);
    setSessionResults([]);
    setIsRunning(false);
    setStartTime(null);
    setCurrentTime(0);
  };

  const handleEndSession = async () => {
    if (sessionSaveStartedRef.current) return;
    sessionSaveStartedRef.current = true;

    // Save session results to database
    console.log('Ending session with results:', sessionResults);
    try {
      if (sessionResults.length > 0) {
        const userId = getUserId();
        console.log('Sending to API:', {
          userId,
          results: sessionResults.map(r => ({
            algorithm_id: r.algorithmId,
            time_ms: r.time
          }))
        });

        const response = await fetch('/api/algorithm-stats', {
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
        
        const responseData = await response.json();
        console.log('API response:', responseData);
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

  // Show loading state with a safety fallback
  if (loading) {
    return <div className="p-20 text-center font-bold text-slate-400">Loading...</div>;
  }

  // Show error state if loading failed AND we have no algorithms
  if (loadingError && algorithms.length === 0) {
    return (
      <div className="p-20 text-center">
        <div className="text-red-500 font-bold mb-4">Error loading algorithms</div>
        <div className="text-slate-600 dark:text-slate-400 mb-4">{loadingError}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-8 bg-white dark:bg-gray-900 min-h-screen">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-2">{dict?.trainer?.title || 'Algorithm Trainer'}</h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{dict?.trainer?.description || 'Practice algorithms with timed sessions and track your progress'}</p>
      </div>

      {state === 'selection' && (
        <>
          <AlgorithmSelector
            algorithms={algorithms}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            dict={dict}
          />
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleStartTraining}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all disabled:bg-slate-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              {dict?.trainer?.start_training || 'Start Training'} ({selectedIds.length} {dict?.trainer?.select_algorithms || 'algorithms'})
            </button>
          </div>
        </>
      )}

      {state === 'training' && currentAlgorithm && (
        <div className="space-y-4 sm:space-y-6">
          {/* Progress */}
          <div className="bg-slate-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-gray-700">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                {dict?.trainer?.session_results || 'Session Results'}: {sessionResults.length}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                {dict?.trainer?.avg || 'Avg'}: {sessionResults.length > 0 ? formatTime(sessionResults.reduce((sum, r) => sum + r.time, 0) / sessionResults.length) : '--'}
              </span>
            </div>
          </div>

          {/* Current Algorithm */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-lg p-4 sm:p-8">
            <div className="text-center mb-4 sm:mb-8">
              {currentAlgorithm ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">{currentAlgorithm.name_en}</h2>
                  {stats[currentAlgorithm.id]?.practice_count > 0 && (
                    <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">
                      {dict?.trainer?.best || 'Best'}: {formatTime(stats[currentAlgorithm.id].best_time_ms || 0)} ·
                      {dict?.trainer?.avg || 'Avg'}: {formatTime(stats[currentAlgorithm.id].avg_time_ms || 0)} ·
                      {stats[currentAlgorithm.id].practice_count} {dict?.trainer?.practices || 'practices'}
                    </p>
                  )}
                  <div className="inline-block bg-slate-900 dark:bg-gray-950 rounded-xl px-4 sm:px-6 py-3 sm:py-4">
                    <div className="text-2xl sm:text-4xl font-black text-indigo-400 dark:text-indigo-300 tracking-wider break-all">
                      {preferredNotations[currentAlgorithm.id] || currentAlgorithm.notation}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400">
                  <p className="text-lg font-semibold mb-2">{dict?.trainer?.no_algorithm_selected || 'No algorithm selected'}</p>
                  <p className="text-sm">{dict?.trainer?.select_algorithms_message || 'Please select algorithms to practice'}</p>
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="text-center mb-6 sm:mb-8">
              <div className={`text-5xl sm:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 font-mono transition-colors duration-200 ${
                isReady ? 'text-emerald-500 dark:text-emerald-400' : isRunning ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'
              }`}>
                {formatTime(isRunning ? currentTime : lastCompletedTime)}
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                {!isRunning ? (
                  <button
                    onMouseDown={() => {
                      // Clear any existing timeouts
                      if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
                      
                      // Set ready state after holding for 100ms
                      readyTimeoutRef.current = setTimeout(() => {
                        setIsReady(true);
                      }, 100);
                    }}
                    onMouseUp={() => {
                      // Clear timeout
                      if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
                      
                      if (isReady) {
                        // Start timer when releasing after being ready
                        setIsRunning(true);
                        setStartTime(Date.now());
                        setCurrentTime(0);
                        setLastCompletedTime(0);
                        setIsReady(false);
                      } else {
                        // Reset ready state if released before ready
                        setIsReady(false);
                      }
                    }}
                    onMouseLeave={() => {
                      // Clear timeout if mouse leaves button
                      if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
                      setIsReady(false);
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      // Clear any existing timeouts
                      if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
                      
                      // Set ready state after holding for 100ms
                      readyTimeoutRef.current = setTimeout(() => {
                        setIsReady(true);
                      }, 100);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      // Clear timeout
                      if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
                      
                      if (isReady) {
                        // Start timer when releasing after being ready
                        setIsRunning(true);
                        setStartTime(Date.now());
                        setCurrentTime(0);
                        setLastCompletedTime(0);
                        setIsReady(false);
                      } else {
                        // Reset ready state if released before ready
                        setIsReady(false);
                      }
                    }}
                    className={`flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-white font-bold rounded-xl transition-all shadow-lg text-sm sm:text-base touch-manipulation active:scale-95 ${
                      isReady ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-800'
                    }`}
                  >
                    <Play className="w-4 h-4 sm:w-6 sm:h-6" />
                    {isReady ? (dict?.trainer?.release_to_start || 'Release to Start') : (dict?.trainer?.hold_space || 'Touch or Hold Space (100ms)')}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsRunning(false);
                      const finalTime = startTime === null ? currentTime : Date.now() - startTime;
                      setLastCompletedTime(finalTime);
                      setCurrentTime(finalTime);
                      setStartTime(null);
                      
                      if (currentAlgorithm) {
                        console.log('Completed solve for:', currentAlgorithm.name_en, 'time:', finalTime);
                        setSessionResults(results => [...results, { algorithmId: currentAlgorithm.id, time: finalTime }]);
                        const nextAlgorithm = getRandomAlgorithm();
                        console.log('Next algorithm:', nextAlgorithm?.name_en);
                        if (nextAlgorithm) {
                          setCurrentAlgorithm(nextAlgorithm);
                        } else {
                          console.error('Failed to get next algorithm, stopping training');
                          setState('selection');
                        }
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-red-600 dark:bg-red-700 text-white font-bold rounded-xl hover:bg-red-700 dark:hover:bg-red-800 transition-all shadow-lg text-sm sm:text-base touch-manipulation active:scale-95"
                  >
                    <Square className="w-4 h-4 sm:w-6 sm:h-6" />
                    {dict?.trainer?.stop || 'Stop'} ({dict?.trainer?.touch_or_space || 'Touch or Space'})
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-gray-600 transition-all text-sm sm:text-base"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  {dict?.trainer?.reset || 'Reset'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
            <button
              onClick={handleBackToSelection}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium transition-colors text-center"
            >
              ← {dict?.trainer?.back_to_selection || 'Back to Selection'}
            </button>
            <button
              onClick={handleEndSession}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium transition-colors text-center"
            >
              {dict?.trainer?.end_session || 'End Session'} →
            </button>
          </div>
        </div>
      )}

      {state === 'summary' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-lg p-4 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">{dict?.trainer?.training_complete || 'Training Complete!'}</h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{dict?.trainer?.training_complete_message ? dict?.trainer?.training_complete_message.replace('{count}', String(sessionResults.length)) : `Great job practicing ${sessionResults.length} algorithms`}</p>
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-slate-50 dark:bg-gray-700 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
                  {sessionResults.length}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{dict?.trainer?.algorithms_label || 'Algorithms'}</div>
              </div>
              <div className="bg-slate-50 dark:bg-gray-700 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                  {formatTime(sessionResults.reduce((sum, r) => sum + r.time, 0))}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{dict?.trainer?.total_time_label || 'Total Time'}</div>
              </div>
              <div className="bg-slate-50 dark:bg-gray-700 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mb-1">
                  {formatTime(sessionResults.reduce((sum, r) => sum + r.time, 0) / sessionResults.length)}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{dict?.trainer?.average_label || 'Average'}</div>
              </div>
            </div>

            {/* Individual Results */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm sm:text-base">{dict?.trainer?.individual_results || 'Individual Results'}</h3>
              {sessionResults.map((result, index) => {
                const alg = algorithms.find(a => a.id === result.algorithmId);
                return (
                  <div key={`${result.algorithmId}-${index}`} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">{alg?.name_en}</div>
                        <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono">{alg?.notation}</div>
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
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
              {dict?.trainer?.new_session || 'New Session'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
