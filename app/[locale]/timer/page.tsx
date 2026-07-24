"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTimerStore, Solve } from "@/hooks/useTimerStore";
import { getTimerAnalytics, formatTimerDuration } from "@/lib/timerAnalytics";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { TimerSidebar } from "@/components/timer/TimerSidebar";
import { AnalyticsDashboard } from "@/components/timer/AnalyticsDashboard";
import { AnalyticsCards } from "@/components/timer/AnalyticsCards";
import { StatsModal } from "@/components/timer/StatsModal";
import { RecordBar } from "@/components/timer/RecordBar";

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

const generateScramble = () => {
  const faces = ["U", "D", "R", "L", "F", "B"];
  const modifiers = ["", "'", "2"];
  let scramble = [];
  let lastFace = -1;
  let secondLastFace = -1;
  for (let i = 0; i < 21; i++) {
    let faceIndex;
    while (true) {
      faceIndex = Math.floor(Math.random() * 6);
      if (faceIndex === lastFace) continue;
      if (Math.floor(faceIndex / 2) === Math.floor(lastFace / 2) && faceIndex === secondLastFace) continue;
      break;
    }
    secondLastFace = lastFace;
    lastFace = faceIndex;
    scramble.push(faces[faceIndex] + modifiers[Math.floor(Math.random() * modifiers.length)]);
  }
  return scramble.join(" ");
};

const getDisplayTime = (solve: Solve) => {
  if (solve.penalty === 'DNF') return 'DNF';
  let t = solve.time;
  if (solve.penalty === '+2') t += 2000;
  return solve.penalty === '+2' ? `${formatTime(t)}+` : formatTime(t);
};

// --- Main Component ---
export default function TimerPage() {
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
  
  // Dashboard states
  const [isAnalyticsMinimized, setIsAnalyticsMinimized] = useState(false);
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

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
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
      if (isAnalyticsMinimized) setIsAnalyticsMinimized(false);
    }
    setShowAnalytics(prev => !prev);
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
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          setChartSize(prev => (prev.w === width && prev.h === height) ? prev : { w: width, h: height });
        }
      });
      observer.observe(node);
      resizeObserverRef.current = observer;
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
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 select-none overflow-hidden font-sans">
      
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
      />

      {/* Main Timer View */}
      <main className="flex-grow flex flex-col items-center justify-center p-8 relative overflow-hidden h-full">
        <TimerControls
          showAnalytics={showAnalytics}
          useInspection={useInspection}
          onToggleAnalytics={handleToggleAnalytics}
          onToggleInspection={() => setUseInspection(!useInspection)}
        />

        <TimerDisplay
          time={time}
          currentScramble={currentScramble}
          timerState={timerState}
          inspectionTime={inspectionTime}
          isHoldingForSolve={isHoldingForSolve}
          formatTime={formatTime}
        />

        {/* Analytics Widget */}
        <AnalyticsDashboard
          show={mounted && showAnalytics}
          isMinimized={isAnalyticsMinimized}
          isFullscreen={isAnalyticsFullscreen}
          position={cardPosition}
          isDragging={isDraggingAnalytics}
          cardOrder={cardOrder}
          analyticsCards={analyticsCards}
          timerState={timerState}
          onClose={() => setShowAnalytics(false)}
          onToggleMinimize={() => setIsAnalyticsMinimized(!isAnalyticsMinimized)}
          onToggleFullscreen={() => { setIsAnalyticsFullscreen(!isAnalyticsFullscreen); setIsAnalyticsMinimized(false); }}
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
        />
      </main>

      {/* Stats Modal */}
      <StatsModal
        show={statsModal?.show || false}
        type={statsModal?.type || ''}
        average={statsModal?.average || ''}
        solves={statsModal?.solves || []}
        sessionName={sessions.find(s => s.id === activeSessionId)?.name || ''}
        onClose={() => setStatsModal(null)}
      />
    </div>
  );
}