"use client";

import { Solve } from "@/hooks/useTimerStore";
import { X } from "lucide-react";

interface SolvesTableProps {
  solves: Solve[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onTogglePenalty: (id: string, penalty: '+2' | 'DNF') => void;
  onDeleteSolve: (id: string) => void;
  onOpenAverageDetails: (index: number, count: number) => void;
  calculateAverageFromSlice: (solvesSlice: Solve[], count: number) => string;
  getDisplayTime: (solve: Solve) => string;
}

export function SolvesTable({
  solves,
  expandedId,
  onToggleExpand,
  onTogglePenalty,
  onDeleteSolve,
  onOpenAverageDetails,
  calculateAverageFromSlice,
  getDisplayTime,
}: SolvesTableProps) {
  return (
    <table className="w-full border-collapse text-left">
      <thead className="sticky top-0 bg-white dark:bg-gray-800 border-b border-slate-100 dark:border-gray-700 z-10">
        <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight">
          <th className="py-2 pl-4 w-10">#</th>
          <th className="py-2 px-2">Time</th>
          <th className="py-2 px-2">Ao5</th>
          <th className="py-2 px-2 pr-4">Ao12</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
        {[...solves].reverse().map((solve, revIndex) => {
          const actualIndex = solves.length - 1 - revIndex;
          const ao5 = calculateAverageFromSlice(solves.slice(0, actualIndex + 1), 5);
          const ao12 = calculateAverageFromSlice(solves.slice(0, actualIndex + 1), 12);
          
          return (
            <tr key={solve.id} className="group hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
              <td className="py-3 pl-4 text-xs font-mono text-slate-300 dark:text-slate-500">{actualIndex + 1}.</td>
              <td className="py-3 px-2">
                 <button 
                   onClick={() => onToggleExpand(solve.id)} 
                   className={`font-mono font-bold text-sm ${solve.penalty === 'DNF' ? 'text-red-400 dark:text-red-300 line-through' : 'text-slate-700 dark:text-slate-200'}`}
                 >
                   {getDisplayTime(solve)}
                 </button>

                 {expandedId === solve.id && (
                  <div className="fixed left-80 top-1/2 -translate-y-1/2 ml-4 w-80 p-5 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-slate-200 dark:border-gray-700 z-50 animate-in fade-in zoom-in duration-150">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Solve Details</h4>
                      <button 
                        onClick={() => onToggleExpand(solve.id)} 
                        className="p-1 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Scramble</span>
                        <p className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-gray-700 p-3 rounded-xl leading-relaxed border border-slate-100 dark:border-gray-600 break-words">{solve.scramble}</p>
                      </div>
                      <div className="flex gap-2">
                         <button 
                           onClick={() => onTogglePenalty(solve.id, '+2')} 
                           className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${solve.penalty === '+2' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-white dark:bg-gray-800 text-slate-500 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-600'}`}
                         >
                           +2
                         </button>
                         <button 
                           onClick={() => onTogglePenalty(solve.id, 'DNF')} 
                           className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${solve.penalty === 'DNF' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-800 text-slate-500 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-600'}`}
                         >
                           DNF
                         </button>
                         <button 
                           onClick={() => {onDeleteSolve(solve.id); onToggleExpand(solve.id);}} 
                           className="flex-1 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                         >
                           Delete
                         </button>
                      </div>
                      <button 
                        onClick={() => onToggleExpand(solve.id)} 
                        className="w-full py-2 bg-slate-800 dark:bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                 )}
              </td>
              <td className="py-3 px-2">
                <button 
                  onClick={() => onOpenAverageDetails(actualIndex, 5)} 
                  className="font-mono text-xs text-indigo-500 dark:text-indigo-400 hover:underline"
                >
                  {ao5}
                </button>
              </td>
              <td className="py-3 px-2 pr-4">
                <button 
                  onClick={() => onOpenAverageDetails(actualIndex, 12)} 
                  className="font-mono text-xs text-indigo-500 dark:text-indigo-400 hover:underline"
                >
                  {ao12}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
