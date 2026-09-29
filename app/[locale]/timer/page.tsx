"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback, use } from "react";
import { useTimerStore, Solve } from "@/hooks/useTimerStore";
import { getTimerAnalytics, formatTimerDuration } from "@/lib/timerAnalytics";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { TimerSidebar } from "@/components/timer/TimerSidebar";
import { AnalyticsDashboard } from "@/components/timer/AnalyticsDashboard";
import { AnalyticsCards } from "@/components/timer/AnalyticsCards";
import { StatsModal } from "@/components/timer/StatsModal";
import { RecordBar } from "@/components/timer/RecordBar";
import { useStreaks } from "@/hooks/useStreaks";
import { getDictionary, type Dictionary } from "@/lib/dictionary";
import { generateScramble } from "@/lib/scrambleGenerator";

// --- Helper Functions ---
const formatTime = (time: number) => (time / 1000).toFixed(2);

const getNumericTime = (solve: Solve) => {
  if (solve.penalty === 'DNF') return Infinity;
  return solve.penalty === '+2' ? solve.time + 2000 : solve.time;
};

const calculateMean = (solves: Solve[]) => {
  const validTimes = solves.map(getNumericTime).filter(t => t !== Infinity);
  if (validTimes.length === 0) return "-";
  return formatTime(validTimes.reduce((a, b) => a + b, 0) / validTimes.length);
};

const getBestSingle = (solves: Solve[]) => {
  if (solves.length === 0) return { display: "-", solves: [] };
  const numericTimes = solves.map(s => ({ solve: s, val: getNumericTime(s) }));
  const valid = numericTimes.filter(t => t.val !== Infinity);
  if (valid.length === 0) return { display: "DNF", solves: [] };
  
  const best = valid.reduce((prev, curr) => prev.val < curr.val ? prev : curr);
  return { display: formatTime(best.val), solves: [best.solve] };
};

const getBestAverage = (solves: Solve[], n: number) => {
  if (solves.length < n) return { display: "-", solves: [] };
  let bestVal = Infinity;
  let bestWindow: Solve[] = [];

  for (let i = 0; i <= solves.length - n; i++) {
    const window = solves.slice(i, i + n);
    const numericWindow = window.map(getNumericTime);
    if (numericWindow.filter(t => t === Infinity).length > 1) continue; 
    
    const sorted = [...numericWindow].sort((a, b) => a - b);
    const middle = sorted.slice(1, -1);
    const avg = middle.reduce((sum, t) => sum + t, 0) / middle.length;
    
    if (avg < bestVal) {
      bestVal = avg;
      bestWindow = window;
    }
  }
  return { 
    display: bestVal === Infinity ? "DNF" : formatTime(bestVal), 
    solves: bestWindow 
  };
};

const calculateAverageFromSlice = (solvesSlice: Solve[], count: number) => {
  if (solvesSlice.length < count) return "-";
  const lastN = solvesSlice.slice(-count).map(getNumericTime);
  const dnfs = lastN.filter(t => t === Infinity).length;
  if (dnfs > 1) return "DNF";
  const sorted = [...lastN].sort((a, b) => a - b);
  const middle = sorted.slice(1, -1);
  return formatTime(middle.reduce((a, b) => a + b, 0) / middle.length);
};

const getDisplayTime = (solve: Solve) => {
  if (solve.penalty === 'DNF') return 'DNF';
  let t = solve.time;
  if (solve.penalty === '+2') t += 2000;
  return solve.penalty === '+2' ? `${formatTime(t)}+` : formatTime(t);
};

// --- Main Component ---
export default function TimerPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale as 'en' | 'vi';
  
  const [time, setTime] = useState(0);
  const [currentScramble, setCurrentScramble] = useState("");
  const [timerState, setTimerState] = useState<'idle' | 'ready' | 'inspecting' | 'solving'>('idle');
  const [mounted, setMounted] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [useInspection, setUseInspection] = useState(true);
  const [inspectionTime, setInspectionTime] = useState(15);
  const [isHoldingForSolve, setIsHoldingForSolve] = useState(false);
  const [statsModal, setStatsModal] = useState<{ show: boolean; type: string; average: string; solves: Solve[]; } | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [dict, setDict] = useState<Dictionary | null>(null);
  
  // Dashboard states
  const [isAnalyticsFullscreen, setIsAnalyticsFullscreen] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [isDraggingAnalytics, setIsDraggingAnalytics] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Analytics Graph States
  const [analyticsRange, setAnalyticsRange] = useState<number | 'all'>(50);
  const [showTimeLine, setShowTimeLine] = useState(true);
  const [showAo5Line, setShowAo5Line] = useState(true);
  const [showAo12Line, setShowAo12Line] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  // Graph Resize State
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [chartSize, setChartSize] = useState({ w: 400, h: 200 });
  
  // Drag and Drop
  const [cardOrder, setCardOrder] = useState(['summary', 'controls', 'chart']);

  const popupRef = useRef<HTMLDivElement>(null);

  const allSolves = useTimerStore((state) => state.solves);
  const sessions = useTimerStore((state) => state.sessions);
  const activeSessionId = useTimerStore((state) => state.activeSessionId);
  const addSolve = useTimerStore((state) => state.addSolve);
  const deleteSolve = useTimerStore((state) => state.deleteSolve);
  const togglePenalty = useTimerStore((state) => state.togglePenalty);
  const clearActiveSession = useTimerStore((state) => state.clearActiveSession);
  const setActiveSession = useTimerStore((state) => state.setActiveSession);
  const addSession = useTimerStore((state) => state.addSession);
  const { updateStreak } = useStreaks();

  const displaySolves = useMemo(() => {
    return mounted ? allSolves.filter(s => s.sessionId === activeSessionId) : [];
  }, [mounted, allSolves, activeSessionId]);

  const bestSingle = useMemo(() => getBestSingle(displaySolves), [displaySolves]);
  const bestAo5 = useMemo(() => getBestAverage(displaySolves, 5), [displaySolves]);
  const bestAo12 = useMemo(() => getBestAverage(displaySolves, 12), [displaySolves]);
  const sessionMean = useMemo(() => calculateMean(displaySolves), [displaySolves]);
  const currentAo5 = useMemo(() => calculateAverageFromSlice(displaySolves, 5), [displaySolves]);
  const currentAo12 = useMemo(() => calculateAverageFromSlice(displaySolves, 12), [displaySolves]);

  const analytics = useMemo(() => getTimerAnalytics(displaySolves), [displaySolves]);

  const visibleTrendPoints = useMemo(() => {
    if (analyticsRange === 'all') return analytics.trendPoints;
    return analytics.trendPoints.slice(-Math.max(analyticsRange, 1));
  }, [analytics.trendPoints, analyticsRange]);

  const graphData = useMemo(() => {
    if (visibleTrendPoints.length === 0) return null;
    
    let minVal = Infinity;
    let maxVal = -Infinity;
    
    visibleTrendPoints.forEach(p => {
      if (showTimeLine && p.timeSeconds !== null) {
        minVal = Math.min(minVal, p.timeSeconds);
        maxVal = Math.max(maxVal, p.timeSeconds);
      }
      if (showAo5Line && p.ao5Seconds !== null) {
        minVal = Math.min(minVal, p.ao5Seconds);
        maxVal = Math.max(maxVal, p.ao5Seconds);
      }
      if (showAo12Line && p.ao12Seconds !== null) {
        minVal = Math.min(minVal, p.ao12Seconds);
        maxVal = Math.max(maxVal, p.ao12Seconds);
      }
    });

    if (minVal === Infinity || maxVal === -Infinity) {
      minVal = 0; maxVal = 10;
    }

    const padding = (maxVal - minVal) * 0.1;
    minVal = Math.max(0, minVal - padding);
    maxVal = maxVal + padding;

    return { minVal, maxVal, range: maxVal - minVal || 1 };
  }, [visibleTrendPoints, showTimeLine, showAo5Line, showAo12Line]);

  useEffect(() => {
    const savedOrder = localStorage.getItem('analyticsCardOrder');
    if (savedOrder) setCardOrder(JSON.parse(savedOrder));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setExpandedId(null);
      }
    };
    if (expandedId) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expandedId]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, []);

  useEffect(() => {
    async function loadDict() {
      const d = await getDictionary(locale);
      setDict(d);
    }
    loadDict();
  }, [locale]);

  useEffect(() => {
    setMounted(true);
    setCurrentScramble(generateScramble());
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingAnalytics || isAnalyticsFullscreen) return;
      setCardPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    };
    const onMouseUp = () => setIsDraggingAnalytics(false);

    if (isDraggingAnalytics) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDraggingAnalytics, isAnalyticsFullscreen]);

  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const inspectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerState === 'inspecting') {
      inspectionIntervalRef.current = setInterval(() => setInspectionTime((prev) => prev - 1), 1000);
    } else {
      if (inspectionIntervalRef.current) clearInterval(inspectionIntervalRef.current);
    }
    return () => { if (inspectionIntervalRef.current) clearInterval(inspectionIntervalRef.current); };
  }, [timerState]);

  useEffect(() => {
    if (timerState === 'solving') {
      const tick = () => {
        setTime(Date.now() - startTimeRef.current);
        animationFrameRef.current = requestAnimationFrame(tick);
      };
      animationFrameRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [timerState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || statsModal?.show) return;
      
      // Check if focus is on an interactive element
      const target = e.target as HTMLElement;
      const interactiveElement = target.closest('button, a, [role="button"], .interactive, select');
      if (interactiveElement) return;
      
      if (e.code === "Space") e.preventDefault();

      if (e.code === "Space" && !e.repeat) {
        if (timerState === 'idle') {
          setTimerState('ready');
        } else if (timerState === 'inspecting') {
          setIsHoldingForSolve(true);
          setTimerState('ready');
        } else if (timerState === 'solving') {
          const finalTime = Date.now() - startTimeRef.current;
          setTime(finalTime);
          let autoPenalty: '+2' | 'DNF' | undefined = undefined;
          if (useInspection) {
            if (inspectionTime < 0 && inspectionTime >= -2) autoPenalty = '+2';
            if (inspectionTime < -2) autoPenalty = 'DNF';
          }
          addSolve({ time: finalTime, scramble: currentScramble, penalty: autoPenalty });
          updateStreak();
          setTimerState('idle');
          setInspectionTime(15);
          setIsHoldingForSolve(false);
          setCurrentScramble(generateScramble());
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        if (timerState === 'ready') {
          if (useInspection && !isHoldingForSolve) {
            setTimerState('inspecting');
          } else {
            startTimeRef.current = Date.now();
            setTimerState('solving');
          }
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || statsModal?.show) return;
      
      // Check if touch is on an interactive element (button, link, etc.)
      const target = e.target as HTMLElement;
      const interactiveElement = target.closest('button, a, [role="button"], .interactive, select, input');
      if (interactiveElement) return;
      
      // Only allow timer activation when touching the timer display area
      const timerArea = target.closest('.timer-touch-area');
      if (!timerArea) return;
      
      e.preventDefault();

      if (timerState === 'idle') {
        setTimerState('ready');
      } else if (timerState === 'inspecting') {
        setIsHoldingForSolve(true);
        setTimerState('ready');
      } else if (timerState === 'solving') {
        const finalTime = Date.now() - startTimeRef.current;
        setTime(finalTime);
        let autoPenalty: '+2' | 'DNF' | undefined = undefined;
        if (useInspection) {
          if (inspectionTime < 0 && inspectionTime >= -2) autoPenalty = '+2';
          if (inspectionTime < -2) autoPenalty = 'DNF';
        }
        addSolve({ time: finalTime, scramble: currentScramble, penalty: autoPenalty });
        updateStreak();
        setTimerState('idle');
        setInspectionTime(15);
        setIsHoldingForSolve(false);
        setCurrentScramble(generateScramble());
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (timerState === 'ready') {
        if (useInspection && !isHoldingForSolve) {
          setTimerState('inspecting');
        } else {
          startTimeRef.current = Date.now();
          setTimerState('solving');
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [timerState, currentScramble, addSolve, useInspection, inspectionTime, isHoldingForSolve, statsModal]);

  const openAverageDetails = useCallback((endIndex: number, count: number) => {
    if (endIndex + 1 < count) return;
    const slice = displaySolves.slice(endIndex + 1 - count, endIndex + 1);
    setStatsModal({
      show: true,
      type: `ao${count}`,
      average: calculateAverageFromSlice(slice, count),
      solves: slice
    });
  }, [displaySolves]);

  const openPBModal = useCallback((type: string, data: { display: string, solves: Solve[] }) => {
    if (data.solves.length === 0) return;
    setStatsModal({ show: true, type, average: data.display, solves: data.solves });
  }, []);

  const handleToggleAnalytics = () => {
    if (!showAnalytics) {
      if (cardPosition.x === 0 && cardPosition.y === 0) {
        setCardPosition({
          x: Math.max(20, (window.innerWidth - 360) / 2),
          y: Math.max(20, (window.innerHeight - 450) / 2)
        });
      }
    }
    setShowAnalytics(prev => !prev);
  };

  const handleToggleFullscreen = () => {
    setIsAnalyticsFullscreen(prev => !prev);
    // Force chart size recalculation after fullscreen change
    setTimeout(() => {
      setChartSize(prev => ({ w: 1, h: 1 })); // Force re-render
      setTimeout(() => {
        const chartContainer = document.querySelector('[data-chart-container]');
        if (chartContainer) {
          const rect = chartContainer.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setChartSize({ w: rect.width, h: rect.height });
          }
        }
      }, 50);
    }, 100);
  };

  const startWidgetDrag = (e: React.MouseEvent) => {
    if (isAnalyticsFullscreen) return; 
    setIsDraggingAnalytics(true);
    dragOffset.current = {
      x: e.clientX - cardPosition.x,
      y: e.clientY - cardPosition.y
    };
  };

  const handleChartRef = useCallback((node: HTMLDivElement | null) => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }
    if (node) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            setChartSize(prev => (prev.w === width && prev.h === height) ? prev : { w: width, h: height });
          }
        }
      });
      observer.observe(node);
      resizeObserverRef.current = observer;
      
      // Initial size calculation with delay to ensure container is rendered
      setTimeout(() => {
        const rect = node.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setChartSize({ w: rect.width, h: rect.height });
        }
      }, 100);
      
      // Additional size calculation attempts
      setTimeout(() => {
        const rect = node.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setChartSize({ w: rect.width, h: rect.height });
        }
      }, 300);
    }
  }, []);




  const analyticsCards = useMemo(() => {
    return AnalyticsCards({
      analytics,
      showTimeLine,
      showAo5Line,
      showAo12Line,
      analyticsRange,
      visibleTrendPoints,
      chartSize,
      graphData,
      displaySolves,
      hoveredPoint,
      onShowTimeLineChange: setShowTimeLine,
      onShowAo5LineChange: setShowAo5Line,
      onShowAo12LineChange: setShowAo12Line,
      onAnalyticsRangeChange: setAnalyticsRange,
      onHoverPoint: setHoveredPoint,
      onChartRef: handleChartRef,
    });
  }, [analytics, showTimeLine, showAo5Line, showAo12Line, analyticsRange, visibleTrendPoints, chartSize, graphData, displaySolves, hoveredPoint, handleChartRef]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-slate-50 dark:bg-gray-900 select-none overflow-hidden font-sans">
      
      {/* Sidebar */}
      <TimerSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        displaySolves={displaySolves}
        currentAo5={currentAo5}
        currentAo12={currentAo12}
        sessionMean={sessionMean}
        onAddSession={addSession}
        onSetActiveSession={setActiveSession}
        onClearSession={clearActiveSession}
        onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
        onTogglePenalty={togglePenalty}
        onDeleteSolve={(id) => {deleteSolve(id); setExpandedId(null);}}
        onOpenAverageDetails={openAverageDetails}
        calculateAverageFromSlice={calculateAverageFromSlice}
        getDisplayTime={getDisplayTime}
        expandedId={expandedId}
        dict={dict}
      />

      {/* Main Timer View */}
      <main className="flex-grow flex flex-col items-center justify-center p-8 relative overflow-hidden h-full bg-white dark:bg-gray-900">
        <TimerControls
          showAnalytics={showAnalytics}
          useInspection={useInspection}
          onToggleAnalytics={handleToggleAnalytics}
          onToggleInspection={() => setUseInspection(!useInspection)}
          dict={dict}
        />

        <TimerDisplay
          time={time}
          currentScramble={currentScramble}
          timerState={timerState}
          inspectionTime={inspectionTime}
          isHoldingForSolve={isHoldingForSolve}
          formatTime={formatTime}
          dict={dict}
        />

        {/* Analytics Widget */}
        <AnalyticsDashboard
          show={mounted && showAnalytics}
          isFullscreen={isAnalyticsFullscreen}
          position={cardPosition}
          isDragging={isDraggingAnalytics}
          cardOrder={cardOrder}
          analyticsCards={analyticsCards}
          timerState={timerState}
          onClose={() => setShowAnalytics(false)}
          onToggleFullscreen={handleToggleFullscreen}
          onStartDrag={startWidgetDrag}
          onCardOrderChange={setCardOrder}
        />

        {/* Record Bar */}
        <RecordBar
          timerState={timerState}
          bestSingle={bestSingle}
          bestAo5={bestAo5}
          bestAo12={bestAo12}
          onOpenPBModal={openPBModal}
          dict={dict}
        />
      </main>

      {/* Stats Modal */}
      <StatsModal
        show={statsModal?.show || false}
        type={statsModal?.type || ''}
        average={statsModal?.average || ''}
        solves={statsModal?.solves || []}
        sessionName={sessions.find(s => s.id === activeSessionId)?.name || ''}
        dict={dict}
        onClose={() => setStatsModal(null)}
      />
    </div>
  );
}