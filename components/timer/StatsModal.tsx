"use client";

import { Solve } from "@/hooks/useTimerStore";

interface StatsModalProps {
  show: boolean;
  type: string;
  average: string;
  solves: Solve[];
  sessionName: string;
  onClose: () => void;
}

export function StatsModal({
  show,
  type,
  average,
  solves,
  sessionName,
  onClose,
}: StatsModalProps) {
  if (!show) return null;

  const getDisplayTime = (solve: Solve) => {
    if (solve.penalty === 'DNF') return 'DNF';
    let t = solve.time;
    if (solve.penalty === '+2') t += 2000;
    return solve.penalty === '+2' ? `${(t / 1000).toFixed(2)}+` : (t / 1000).toFixed(2);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-black uppercase text-slate-800 tracking-tight">Record Details</h3>
            <p className="text-sm text-slate-500 font-medium">Session: {sessionName}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase block leading-none">{type}</span>
            <span className="text-2xl font-mono font-black text-indigo-600">{average}</span>
          </div>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm font-mono">
            <thead className="text-left text-slate-400 uppercase text-[10px] border-b border-slate-100">
              <tr><th className="pb-2 font-black">#</th><th className="pb-2 font-black">Time</th><th className="pb-2 font-black">Scramble</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {solves.map((s, i) => (
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
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
