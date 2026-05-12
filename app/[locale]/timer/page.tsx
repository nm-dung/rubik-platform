"use client";

import { useState, useEffect, useRef } from "react";
import { useTimerStore, Solve } from "@/hooks/useTimerStore";
import { X } from "lucide-react";

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

  const displaySolves = mounted ? allSolves.filter(s => s.sessionId === activeSessionId) : [];

  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const inspectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setExpandedId(null);
      }
    };
    if (expandedId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expandedId]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  useEffect(() => {
    setMounted(true);
    setCurrentScramble(generateScramble());
  }, []);

  useEffect(() => {
    if (timerState === 'inspecting') {
      inspectionIntervalRef.current = setInterval(() => {
        setInspectionTime((prev) => prev - 1);
      }, 1000);
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

  const openAverageDetails = (endIndex: number, count: number) => {
    if (endIndex + 1 < count) return;
    const slice = displaySolves.slice(endIndex + 1 - count, endIndex + 1);
    setStatsModal({
      show: true,
      type: `ao${count}`,
      average: calculateAverageFromSlice(slice, count),
      solves: slice
    });
  };

  const openPBModal = (type: string, data: { display: string, solves: Solve[] }) => {
    if (data.solves.length === 0) return;
    setStatsModal({
      show: true,
      type: type,
      average: data.display,
      solves: data.solves
    });
  };

  const getTimerColor = () => {
    if (timerState === 'ready') return 'text-emerald-500';
    if (timerState === 'inspecting') return 'text-red-500';
    return 'text-slate-800';
  };

  // Pre-calculate bests
  const bestSingle = getBestSingle(displaySolves);
  const bestAo5 = getBestAverage(displaySolves, 5);
  const bestAo12 = getBestAverage(displaySolves, 12);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 select-none overflow-hidden font-sans">
      
      <aside className="w-80 border-r border-slate-200 bg-white hidden md:flex flex-col shadow-sm z-10 relative">
        <div className="p-4 border-b border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sessions</h2>
            <button onClick={() => addSession(`Session ${sessions.length + 1}`)} className="text-indigo-600 text-[10px] font-bold hover:underline">+ NEW</button>
          </div>
          <select value={activeSessionId} onChange={(e) => setActiveSession(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium outline-none cursor-pointer">
            {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => openAverageDetails(displaySolves.length - 1, 5)} className="flex flex-col items-start hover:bg-white p-2 rounded-lg transition-all border border-transparent hover:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Ao5</span>
              <span className="text-xl font-mono font-black text-indigo-600 leading-tight">{calculateAverageFromSlice(displaySolves, 5)}</span>
            </button>
            <button onClick={() => openAverageDetails(displaySolves.length - 1, 12)} className="flex flex-col items-start hover:bg-white p-2 rounded-lg transition-all border border-transparent hover:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Ao12</span>
              <span className="text-xl font-mono font-black text-indigo-600 leading-tight">{calculateAverageFromSlice(displaySolves, 12)}</span>
            </button>
            <div className="flex flex-col p-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Solves</span>
              <span className="text-base font-mono font-bold text-slate-700">{displaySolves.length}</span>
            </div>
            <div className="flex flex-col p-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Mean</span>
              <span className="text-base font-mono font-bold text-slate-700">{calculateMean(displaySolves)}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 bg-white border-b border-slate-100 z-10">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                <th className="py-2 pl-4 w-10">#</th>
                <th className="py-2 px-2">Time</th>
                <th className="py-2 px-2">Ao5</th>
                <th className="py-2 px-2 pr-4">Ao12</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...displaySolves].reverse().map((solve, revIndex) => {
                const actualIndex = displaySolves.length - 1 - revIndex;
                const ao5 = calculateAverageFromSlice(displaySolves.slice(0, actualIndex + 1), 5);
                const ao12 = calculateAverageFromSlice(displaySolves.slice(0, actualIndex + 1), 12);
                
                return (
                  <tr key={solve.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-3 pl-4 text-xs font-mono text-slate-300">{actualIndex + 1}.</td>
                    <td className="py-3 px-2">
                       <button onClick={() => setExpandedId(expandedId === solve.id ? null : solve.id)} className={`font-mono font-bold text-sm ${solve.penalty === 'DNF' ? 'text-red-400 line-through' : 'text-slate-700'}`}>
                         {getDisplayTime(solve)}
                       </button>

                       {expandedId === solve.id && (
                        <div ref={popupRef} className="fixed left-80 top-1/2 -translate-y-1/2 ml-4 w-80 p-5 bg-white shadow-2xl rounded-2xl border border-slate-200 z-50 animate-in fade-in zoom-in duration-150">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Solve Details</h4>
                            <button onClick={() => setExpandedId(null)} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"><X size={16} /></button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Scramble</span>
                              <p className="text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed border border-slate-100 break-words">{solve.scramble}</p>
                            </div>
                            <div className="flex gap-2">
                               <button onClick={() => togglePenalty(solve.id, '+2')} className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${solve.penalty === '+2' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white text-slate-500 hover:border-indigo-200'}`}>+2</button>
                               <button onClick={() => togglePenalty(solve.id, 'DNF')} className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${solve.penalty === 'DNF' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-slate-500 hover:border-indigo-200'}`}>DNF</button>
                               <button onClick={() => {deleteSolve(solve.id); setExpandedId(null);}} className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">Delete</button>
                            </div>
                            <button onClick={() => setExpandedId(null)} className="w-full py-2 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95">Done</button>
                          </div>
                        </div>
                       )}
                    </td>
                    <td className="py-3 px-2">
                      <button onClick={() => openAverageDetails(actualIndex, 5)} className="font-mono text-xs text-indigo-500 hover:underline">{ao5}</button>
                    </td>
                    <td className="py-3 px-2 pr-4">
                      <button onClick={() => openAverageDetails(actualIndex, 12)} className="font-mono text-xs text-indigo-500 hover:underline">{ao12}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {displaySolves.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <button onClick={clearActiveSession} className="w-full py-2.5 text-xs font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 rounded-lg hover:text-red-500 transition-colors shadow-sm">Clear Session</button>
          </div>
        )}
      </aside>

      <main className="flex-grow flex flex-col items-center justify-center p-8 relative overflow-hidden h-full">
        <div className="absolute top-8 right-8 flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">15s Inspection</span>
          <button onClick={() => setUseInspection(!useInspection)} className={`w-12 h-6 rounded-full transition-colors relative ${useInspection ? 'bg-indigo-600' : 'bg-slate-300'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${useInspection ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className={`text-2xl md:text-4xl font-mono font-bold text-center text-slate-700 max-w-4xl tracking-wide mb-24 transition-opacity duration-200 ${timerState === 'solving' ? 'opacity-0' : 'opacity-100'}`}>
          {currentScramble}
        </div>

        <div className={`text-[8rem] md:text-[12rem] font-black font-mono leading-none tracking-tighter transition-colors duration-150 ${getTimerColor()}`}>
          {(timerState === 'inspecting' || (timerState === 'ready' && isHoldingForSolve)) ? (
             <span>{inspectionTime > 0 ? inspectionTime : inspectionTime > -2 ? '+2' : 'DNF'}</span>
          ) : formatTime(time)}
        </div>

        <div className={`absolute bottom-24 text-slate-400 font-bold uppercase tracking-widest transition-opacity duration-200 ${timerState === 'solving' ? 'opacity-0' : 'opacity-100'}`}>
          {timerState === 'inspecting' || isHoldingForSolve ? 'Hold Space to start solve' : 'Hold Space to start'}
        </div>

        <div className={`absolute bottom-0 left-0 right-0 bg-white/50 backdrop-blur-sm border-t border-slate-200 px-8 py-4 flex justify-center gap-12 transition-opacity duration-200 ${timerState === 'solving' ? 'opacity-0' : 'opacity-100'}`}>
          <button 
            onClick={() => openPBModal("Best Single", bestSingle)}
            className="flex flex-col items-center hover:bg-white/50 p-1 px-4 rounded-lg transition-all border border-transparent hover:border-slate-200"
          >
            <span className="text-[10px] font-black uppercase text-slate-400">Best Single</span>
            <span className="text-sm font-mono font-bold text-slate-700">{bestSingle.display}</span>
          </button>
          <button 
            onClick={() => openPBModal("Best Ao5", bestAo5)}
            className="flex flex-col items-center border-x border-slate-200 px-12 hover:bg-white/50 rounded-lg transition-all"
          >
            <span className="text-[10px] font-black uppercase text-slate-400">Best Ao5</span>
            <span className="text-sm font-mono font-bold text-slate-700">{bestAo5.display}</span>
          </button>
          <button 
            onClick={() => openPBModal("Best Ao12", bestAo12)}
            className="flex flex-col items-center hover:bg-white/50 p-1 px-4 rounded-lg transition-all border border-transparent hover:border-slate-200"
          >
            <span className="text-[10px] font-black uppercase text-slate-400">Best Ao12</span>
            <span className="text-sm font-mono font-bold text-slate-700">{bestAo12.display}</span>
          </button>
        </div>
      </main>

      {statsModal?.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-black uppercase text-slate-800 tracking-tight">Record Details</h3>
                <p className="text-sm text-slate-500 font-medium">Session: {sessions.find(s => s.id === activeSessionId)?.name}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase block leading-none">{statsModal.type}</span>
                <span className="text-2xl font-mono font-black text-indigo-600">{statsModal.average}</span>
              </div>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm font-mono">
                <thead className="text-left text-slate-400 uppercase text-[10px] border-b border-slate-100">
                  <tr><th className="pb-2 font-black">#</th><th className="pb-2 font-black">Time</th><th className="pb-2 font-black">Scramble</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {statsModal.solves.map((s, i) => (
                    <tr key={s.id} className="group">
                      <td className="py-3 text-slate-300">{i + 1}</td>
                      <td className={`py-3 font-bold pr-4 whitespace-nowrap ${s.penalty === 'DNF' ? 'text-red-400 line-through' : 'text-slate-700'}`}>{getDisplayTime(s)}</td>
                      <td className="py-3 text-[11px] text-slate-500 leading-relaxed group-hover:text-slate-800 transition-colors">{s.scramble}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setStatsModal(null)} className="px-6 py-2 bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-600 transition-all shadow-lg active:scale-95">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}