"use client";

import type { Solve } from "@/hooks/useTimerStore";

interface RecordBarProps {
  timerState: 'idle' | 'ready' | 'inspecting' | 'solving';
  bestSingle: { display: string; solves: Solve[] };
  bestAo5: { display: string; solves: Solve[] };
  bestAo12: { display: string; solves: Solve[] };
  onOpenPBModal: (type: string, data: { display: string; solves: Solve[] }) => void;
}

export function RecordBar({
  timerState,
  bestSingle,
  bestAo5,
  bestAo12,
  onOpenPBModal,
}: RecordBarProps) {
  return (
    <div className={`absolute bottom-0 left-0 right-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-slate-200 dark:border-gray-700 px-8 py-4 flex justify-center gap-12 transition-opacity duration-200 ${timerState === 'solving' ? 'opacity-0' : 'opacity-100'}`}>
      <button 
        onClick={() => onOpenPBModal("Best Single", bestSingle)}
        className="flex flex-col items-center hover:bg-white/50 dark:hover:bg-gray-700/50 p-1 px-4 rounded-lg transition-all border border-transparent hover:border-slate-200 dark:hover:border-gray-600"
      >
        <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">Best Single</span>
        <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200">{bestSingle.display}</span>
      </button>
      <button 
        onClick={() => onOpenPBModal("Best Ao5", bestAo5)}
        className="flex flex-col items-center border-x border-slate-200 dark:border-gray-600 px-12 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all"
      >
        <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">Best Ao5</span>
        <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200">{bestAo5.display}</span>
      </button>
      <button 
        onClick={() => onOpenPBModal("Best Ao12", bestAo12)}
        className="flex flex-col items-center hover:bg-white/50 dark:hover:bg-gray-700/50 p-1 px-4 rounded-lg transition-all border border-transparent hover:border-slate-200 dark:hover:border-gray-600"
      >
        <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">Best Ao12</span>
        <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200">{bestAo12.display}</span>
      </button>
    </div>
  );
}
