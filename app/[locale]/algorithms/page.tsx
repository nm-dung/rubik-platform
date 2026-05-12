"use client";

import { useState, useEffect, use } from "react"; 
import { getDictionary } from "@/lib/dictionary";
import { supabase } from "@/lib/supabase";
import CubeScene from "@/components/cube/CubeScene";

export default function AlgorithmsPage({ params }: { params: Promise<{ locale: 'en' | 'vi' }> }) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;

  const [activeTab, setActiveTab] = useState('PLL');
  const [algorithms, setAlgorithms] = useState<any[]>([]);
  const [dict, setDict] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const d = await getDictionary(locale);
      setDict(d);

      const { data, error } = await supabase.from('algorithms').select('*');
      if (error) console.error("Supabase error:", error);
      else setAlgorithms(data || []);
      
      setLoading(false);
    }
    loadData();
  }, [locale]); 

  if (loading || !dict) return <div className="p-20 text-center font-bold text-slate-400">Loading Dictionary...</div>;

  const categories = ['F2L', 'OLL', 'PLL'];
  const filteredAlgs = algorithms.filter(alg => alg.category === activeTab);

  return (
    <main className="max-w-5xl mx-auto p-8">
      <section className="mb-16 grid lg:grid-cols-2 gap-12 items-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <CubeScene />
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">{dict.algorithms.title}</h1>
          <p className="text-lg text-slate-600 leading-relaxed">{dict.algorithms.description}</p>
        </div>
      </section>

      <div className="flex gap-8 mb-8 border-b border-slate-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === cat 
                ? "border-b-4 border-indigo-600 text-indigo-600" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {filteredAlgs.map((alg) => (
          <div key={alg.id} className="group relative flex flex-col md:flex-row gap-6 p-6 border border-slate-200 rounded-2xl bg-white hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
  
  <div className="w-full md:w-32 h-32 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
    {alg.image_url ? (
      <img src={alg.image_url} alt={alg.name_en} className="w-full h-full object-contain p-2 mix-blend-multiply" />
    ) : (
      <div className="text-[10px] font-bold text-slate-300 uppercase text-center p-2">Pattern Image</div>
    )}
  </div>

  <div className="flex-grow flex flex-col">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
          {locale === 'vi' ? alg.name_vi : alg.name_en}
        </h3>
        <div className="flex gap-2 mt-1">
          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded uppercase tracking-tighter border border-indigo-100">
            {alg.difficulty}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95">
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
        ))}
      </div>
    </main>
  );
}