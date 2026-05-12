"use client";

import { useState, useEffect, useRef } from "react";
import { useTimerStore, Solve } from "@/hooks/useTimerStore";

// --- SCRAMBLER ---
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

const formatTime = (time: number) => (time / 1000).toFixed(2);

const getDisplayTime = (solve: Solve) => {
  if (solve.penalty === 'DNF') return 'DNF';
  let t = solve.time;
  if (solve.penalty === '+2') t += 2000;
  return solve.penalty === '+2' ? `${formatTime(t)}+` : formatTime(t);
};

const calculateAo5 = (solves: Solve[]) => {
  if (solves.length < 5) return "-";
  const last5 = solves.slice(-5);
  const values = last5.map(s => {
    if (s.penalty === 'DNF') return Infinity;
    if (s.penalty === '+2') return s.time + 2000;
    return s.time;
  });
  values.sort((a, b) => a - b);
  if (values[3] === Infinity) return "DNF";
  const avg = (values[1] + values[2] + values[3]) / 3;
  return formatTime(avg);
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

  const solves = useTimerStore((state) => state.solves);
  const addSolve = useTimerStore((state) => state.addSolve);
  const deleteSolve = useTimerStore((state) => state.deleteSolve);
  const togglePenalty = useTimerStore((state) => state.togglePenalty);
  const clearSession = useTimerStore((state) => state.clearSession);

  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const inspectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") e.preventDefault();

      if (e.code === "Space" && !e.repeat) {
        if (timerState === 'idle') {
          setTimerState('ready');
        } else if (timerState === 'inspecting') {
          setIsHoldingForSolve(true);
          setTimerState('ready');
        } else if (timerState === 'solving') {
          // STOP
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
  }, [timerState, currentScramble, addSolve, useInspection, inspectionTime, isHoldingForSolve]);

  const getTimerColor = () => {
    if (timerState === 'ready') return 'text-emerald-500';
    if (timerState === 'inspecting') return 'text-red-500';
    return 'text-slate-800';
  };

  const displaySolves = mounted ? solves : [];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 select-none overflow-hidden font-sans">
      
      <aside className="w-80 border-r border-slate-200 bg-white hidden md:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Session Info</h2>
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold text-slate-700">Ao5</span>
            <span className="text-2xl font-mono font-black text-indigo-600">{calculateAo5(displaySolves)}</span>
          </div>
          <div className="flex justify-between items-end mt-1">
            <span className="text-sm font-bold text-slate-700">Solves</span>
            <span className="text-lg font-mono font-bold text-slate-500">{displaySolves.length}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          {displaySolves.map((solve, index) => (
            <div key={solve.id} className="flex flex-col bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all overflow-hidden flex-shrink-0">
              <button 
                onClick={() => setExpandedId(expandedId === solve.id ? null : solve.id)}
                className={`flex justify-between items-center p-3 w-full text-left transition-colors ${expandedId === solve.id ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
              >
                <span className="text-slate-400 text-sm font-mono">{index + 1}.</span>
                <span className={`font-bold font-mono text-base ${solve.penalty === 'DNF' ? 'text-red-500 line-through' : 'text-slate-700'}`}>
                  {getDisplayTime(solve)}
                </span>
              </button>

              {expandedId === solve.id && (
                <div className="p-3 bg-slate-50 border-t border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Scramble</div>
                  <div className="text-xs font-mono text-slate-600 mb-3 bg-white p-2 rounded border border-slate-200 leading-relaxed whitespace-normal break-words">
                    {solve.scramble}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => togglePenalty(solve.id, '+2')} className={`flex-1 py-1.5 text-xs font-bold rounded border transition-colors ${solve.penalty === '+2' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white text-slate-500 border-slate-200 hover:border-amber-300'}`}>+2</button>
                    <button onClick={() => togglePenalty(solve.id, 'DNF')} className={`flex-1 py-1.5 text-xs font-bold rounded border transition-colors ${solve.penalty === 'DNF' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-slate-500 border-slate-200 hover:border-red-300'}`}>DNF</button>
                    <button onClick={() => deleteSolve(solve.id)} className="flex-1 py-1.5 text-xs font-bold bg-white text-slate-400 rounded border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">Delete</button>
                  </div>
                </div>
              )}
            </div>
          )).reverse()}
        </div>
        
        {displaySolves.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <button onClick={clearSession} className="w-full py-2.5 text-xs font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 rounded-lg hover:text-red-500 hover:border-red-200 transition-colors shadow-sm">
              Clear Session
            </button>
          </div>
        )}
      </aside>

      <main className="flex-grow flex flex-col items-center justify-center p-8 relative overflow-hidden h-full">
        
        <div className="absolute top-8 right-8 flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">15s Inspection</span>
            <button 
                onClick={() => setUseInspection(!useInspection)}
                className={`w-12 h-6 rounded-full transition-colors relative ${useInspection ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${useInspection ? 'left-7' : 'left-1'}`} />
            </button>
        </div>

        <div className={`text-2xl md:text-4xl font-mono font-bold text-center text-slate-700 max-w-4xl tracking-wide mb-24 transition-opacity duration-200 ${timerState === 'solving' ? 'opacity-0' : 'opacity-100'}`}>
          {currentScramble}
        </div>

        <div className={`text-[8rem] md:text-[12rem] font-black font-mono leading-none tracking-tighter transition-colors duration-150 ${getTimerColor()}`}>
          {(timerState === 'inspecting' || (timerState === 'ready' && isHoldingForSolve)) ? (
             <span>
                {inspectionTime > 0 ? inspectionTime : inspectionTime > -2 ? '+2' : 'DNF'}
             </span>
          ) : formatTime(time)}
        </div>

        <div className={`absolute bottom-12 text-slate-400 font-bold uppercase tracking-widest transition-opacity duration-200 ${timerState === 'solving' ? 'opacity-0' : 'opacity-100'}`}>
          {timerState === 'inspecting' || isHoldingForSolve ? 'Hold Space to start solve' : 'Hold Space to start'}
        </div>
      </main>
    </div>
  );
}