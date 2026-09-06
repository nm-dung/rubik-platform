"use client";

import type { Dictionary } from "@/lib/dictionary";

interface TimerControlsProps {
  showAnalytics: boolean;
  useInspection: boolean;
  onToggleAnalytics: () => void;
  onToggleInspection: () => void;
  dict?: Dictionary | null;
}

export function TimerControls({
  showAnalytics,
  useInspection,
  onToggleAnalytics,
  onToggleInspection,
  dict,
}: TimerControlsProps) {
  return (
    <div className="absolute top-4 sm:top-8 right-4 sm:right-8 flex flex-wrap items-center justify-end gap-2 sm:gap-3 z-20">
      <button
        onClick={onToggleAnalytics}
        className="interactive rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-gray-800/80 px-3 sm:px-4 py-2 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 hover:shadow-md hover:shadow-indigo-500/20 active:scale-95 touch-manipulation"
      >
        {showAnalytics ? (dict?.timer?.hide_analytics || 'Hide Analytics') : (dict?.timer?.show_analytics || 'Show Analytics')}
      </button>
      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{dict?.timer?.inspection_label || '15s Inspection'}</span>
      <button 
        onClick={onToggleInspection} 
        className={`interactive w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-all duration-300 relative hover:scale-110 active:scale-95 touch-manipulation ${useInspection ? 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'}`}
      >
        <div className={`absolute top-0.5 sm:top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full transition-all duration-300 ${useInspection ? 'left-5 sm:left-7' : 'left-0.5 sm:left-1'}`} />
      </button>
    </div>
  );
}
