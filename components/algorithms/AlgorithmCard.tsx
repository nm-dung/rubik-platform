"use client";

import { useCubeStore } from "@/hooks/useCubeStore";
import { useEffect, useState } from "react";

export default function AlgorithmCard({ alg, locale = 'en' }: { alg: any, locale?: string }) {
  const setAlgorithm = useCubeStore((state) => state.setAlgorithm);
  
  const learnedAlgs = useCubeStore((state) => state.learnedAlgs);
  const toggleLearned = useCubeStore((state) => state.toggleLearned);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isLearned = mounted ? learnedAlgs.includes(alg.id) : false;

  return (
    <div className={`group relative flex flex-col md:flex-row gap-6 p-6 border rounded-2xl bg-white hover:shadow-xl transition-all duration-300 ${
      isLearned ? 'border-emerald-400 bg-emerald-50/10' : 'border-slate-200 hover:border-indigo-100'
    }`}>
      
      <div className="w-full md:w-32 h-32 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
        {alg.image_url ? (
          <img src={alg.image_url} alt={alg.name_en || alg.name} className="w-full h-full object-contain p-2 mix-blend-multiply" />
        ) : (
          <div className="text-[10px] font-bold text-slate-300 uppercase text-center p-2">Pattern Image</div>
        )}
      </div>

      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                {locale === 'vi' ? alg.name_vi : (alg.name_en || alg.name)}
              </h3>
              {isLearned && (
                <span className="text-emerald-500 bg-emerald-100 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
              )}
            </div>
            <div className="flex gap-2 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded uppercase tracking-tighter border border-indigo-100">
                {alg.difficulty || alg.category}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setAlgorithm(alg.notation)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
            >
              <span>Practice</span>
            </button>
            
            <button 
              onClick={() => toggleLearned(alg.id)}
              className={`p-2 rounded-lg transition-all border ${
                isLearned 
                  ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600' 
                  : 'text-slate-400 bg-white border-slate-200 hover:border-emerald-400 hover:text-emerald-500'
              }`}
              title="Mark as learned"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
        </div>
        
        <div className="mt-auto p-4 bg-slate-900 rounded-xl shadow-inner font-mono text-lg text-indigo-300 tracking-widest overflow-x-auto whitespace-nowrap">
          {alg.notation}
        </div>
      </div>
    </div>
  );
}