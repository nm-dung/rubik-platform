"use client";

import { Solve } from "@/hooks/useTimerStore";
import { SolvesTable } from "./SolvesTable";

interface TimerSidebarProps {
  sessions: { id: string; name: string }[];
  activeSessionId: string;
  displaySolves: Solve[];
  currentAo5: string;
  currentAo12: string;
  sessionMean: string;
  onAddSession: (name: string) => void;
  onSetActiveSession: (id: string) => void;
  onClearSession: () => void;
  onToggleExpand: (id: string) => void;
  onTogglePenalty: (id: string, penalty: '+2' | 'DNF') => void;
  onDeleteSolve: (id: string) => void;
  onOpenAverageDetails: (index: number, count: number) => void;
  calculateAverageFromSlice: (solvesSlice: Solve[], count: number) => string;
  getDisplayTime: (solve: Solve) => string;
  expandedId: string | null;
}

export function TimerSidebar({
  sessions,
  activeSessionId,
  displaySolves,
  currentAo5,
  currentAo12,
  sessionMean,
  onAddSession,
  onSetActiveSession,
  onClearSession,
  onToggleExpand,
  onTogglePenalty,
  onDeleteSolve,
  onOpenAverageDetails,
  calculateAverageFromSlice,
  getDisplayTime,
  expandedId,
}: TimerSidebarProps) {
  return (
    <aside className="w-80 border-r border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 hidden md:flex flex-col shadow-sm z-10 relative">
      <div className="p-4 border-b border-slate-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Sessions</h2>
          <button 
            onClick={() => onAddSession(`Session ${sessions.length + 1}`)} 
            className="interactive text-indigo-600 dark:text-indigo-400 text-[10px] font-bold hover:underline"
          >
            + NEW
          </button>
        </div>
        <select 
          value={activeSessionId} 
          onChange={(e) => onSetActiveSession(e.target.value)} 
          className="interactive w-full p-2 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded text-sm font-medium outline-none cursor-pointer text-slate-900 dark:text-white"
        >
          {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="p-5 border-b border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-700/50">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => onOpenAverageDetails(displaySolves.length - 1, 5)} 
            className="interactive flex flex-col items-start hover:bg-white dark:hover:bg-gray-600 p-2 rounded-lg transition-all border border-transparent hover:border-slate-200 dark:hover:border-gray-600"
          >
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Ao5</span>
            <span className="text-xl font-mono font-black text-indigo-600 dark:text-indigo-400 leading-tight">{currentAo5}</span>
          </button>
          <button 
            onClick={() => onOpenAverageDetails(displaySolves.length - 1, 12)} 
            className="interactive flex flex-col items-start hover:bg-white dark:hover:bg-gray-600 p-2 rounded-lg transition-all border border-transparent hover:border-slate-200 dark:hover:border-gray-600"
          >
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Ao12</span>
            <span className="text-xl font-mono font-black text-indigo-600 dark:text-indigo-400 leading-tight">{currentAo12}</span>
          </button>
          <div className="flex flex-col p-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Solves</span>
            <span className="text-base font-mono font-bold text-slate-700 dark:text-slate-300">{displaySolves.length}</span>
          </div>
          <div className="flex flex-col p-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Mean</span>
            <span className="text-base font-mono font-bold text-slate-700 dark:text-slate-300">{sessionMean}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <SolvesTable
          solves={displaySolves}
          expandedId={expandedId}
          onToggleExpand={onToggleExpand}
          onTogglePenalty={onTogglePenalty}
          onDeleteSolve={onDeleteSolve}
          onOpenAverageDetails={onOpenAverageDetails}
          calculateAverageFromSlice={calculateAverageFromSlice}
          getDisplayTime={getDisplayTime}
        />
      </div>
      
      {displaySolves.length > 0 && (
        <div className="p-4 border-t border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-700/50">
          <button 
            onClick={onClearSession} 
            className="interactive w-full py-2.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg hover:text-red-500 dark:hover:text-red-400 transition-colors shadow-sm"
          >
            Clear Session
          </button>
        </div>
      )}
    </aside>
  );
}
