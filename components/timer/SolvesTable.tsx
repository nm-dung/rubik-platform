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
      <thead className="sticky top-0 bg-white border-b border-slate-100 z-10">
        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
          <th className="py-2 pl-4 w-10">#</th>
          <th className="py-2 px-2">Time</th>
          <th className="py-2 px-2">Ao5</th>
          <th className="py-2 px-2 pr-4">Ao12</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {[...solves].reverse().map((solve, revIndex) => {
          const actualIndex = solves.length - 1 - revIndex;
          const ao5 = calculateAverageFromSlice(solves.slice(0, actualIndex + 1), 5);
          const ao12 = calculateAverageFromSlice(solves.slice(0, actualIndex + 1), 12);
          
          return (
            <tr key={solve.id} className="group hover:bg-slate-50 transition-colors">
              <td className="py-3 pl-4 text-xs font-mono text-slate-300">{actualIndex + 1}.</td>
              <td className="py-3 px-2">
                 <button 
                   onClick={() => onToggleExpand(solve.id)} 
                   className={`font-mono font-bold text-sm ${solve.penalty === 'DNF' ? 'text-red-400 line-through' : 'text-slate-700'}`}
                 >
                   {getDisplayTime(solve)}
                 </button>

                 {expandedId === solve.id && (
                  <div className="fixed left-80 top-1/2 -translate-y-1/2 ml-4 w-80 p-5 bg-white shadow-2xl rounded-2xl border border-slate-200 z-50 animate-in fade-in zoom-in duration-150">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Solve Details</h4>
                      <button 
                        onClick={() => onToggleExpand(solve.id)} 
                        className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Scramble</span>
                        <p className="text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed border border-slate-100 break-words">{solve.scramble}</p>
                      </div>
                      <div className="flex gap-2">
                         <button 
                           onClick={() => onTogglePenalty(solve.id, '+2')} 
                           className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${solve.penalty === '+2' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white text-slate-500 hover:border-indigo-200'}`}
                         >
                           +2
                         </button>
                         <button 
                           onClick={() => onTogglePenalty(solve.id, 'DNF')} 
                           className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${solve.penalty === 'DNF' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-slate-500 hover:border-indigo-200'}`}
                         >
                           DNF
                         </button>
                         <button 
                           onClick={() => {onDeleteSolve(solve.id); onToggleExpand(solve.id);}} 
                           className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                         >
                           Delete
                         </button>
                      </div>
                      <button 
                        onClick={() => onToggleExpand(solve.id)} 
                        className="w-full py-2 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
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
                  className="font-mono text-xs text-indigo-500 hover:underline"
                >
                  {ao5}
                </button>
              </td>
              <td className="py-3 px-2 pr-4">
                <button 
                  onClick={() => onOpenAverageDetails(actualIndex, 12)} 
                  className="font-mono text-xs text-indigo-500 hover:underline"
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
