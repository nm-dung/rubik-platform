"use client";

interface TimerControlsProps {
  showAnalytics: boolean;
  useInspection: boolean;
  onToggleAnalytics: () => void;
  onToggleInspection: () => void;
}

export function TimerControls({
  showAnalytics,
  useInspection,
  onToggleAnalytics,
  onToggleInspection,
}: TimerControlsProps) {
  return (
    <div className="absolute top-8 right-8 flex flex-wrap items-center justify-end gap-3 z-20">
      <button
        onClick={onToggleAnalytics}
        className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-600 hover:scale-105 hover:shadow-md hover:shadow-indigo-500/20"
      >
        {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
      </button>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">15s Inspection</span>
      <button 
        onClick={onToggleInspection} 
        className={`w-12 h-6 rounded-full transition-all duration-300 relative hover:scale-110 ${useInspection ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30' : 'bg-slate-300 hover:bg-slate-400'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${useInspection ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
}
