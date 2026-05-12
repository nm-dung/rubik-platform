"use client";

import { useCubeStore } from "@/hooks/useCubeStore";

export default function AlgorithmCard({ alg, locale = 'en' }: { alg: any, locale?: string }) {
  const setAlgorithm = useCubeStore((state) => state.setAlgorithm);

  return (
    <div className="group relative flex flex-col md:flex-row gap-6 p-6 border border-slate-200 rounded-2xl bg-white hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
      
      {/* Pattern Image Section */}
      <div className="w-full md:w-32 h-32 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
        {alg.image_url ? (
          <img src={alg.image_url} alt={alg.name_en || alg.name} className="w-full h-full object-contain p-2 mix-blend-multiply" />
        ) : (
          <div className="text-[10px] font-bold text-slate-300 uppercase text-center p-2">Pattern Image</div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
              {locale === 'vi' ? alg.name_vi : (alg.name_en || alg.name)}
            </h3>
            <div className="flex gap-2 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded uppercase tracking-tighter border border-indigo-100">
                {alg.difficulty || alg.category}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={() => {
                console.log("1. BUTTON CLICKED! Sending notation:", alg.notation);
                setAlgorithm(alg.notation);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
            >
              <span>Practice</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l14 9-14 9V3z"/></svg>
            </button>
            
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Time this alg">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
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