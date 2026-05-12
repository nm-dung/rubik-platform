"use client";

import { useState, useEffect, use } from "react"; 
import { getDictionary } from "@/lib/dictionary";
import { supabase } from "@/lib/supabase";
import CubeScene from "@/components/cube/CubeScene";
import AlgorithmCard from "@/components/algorithms/AlgorithmCard"; 

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
          <AlgorithmCard key={alg.id} alg={alg} locale={locale} />
        ))}
      </div>
    </main>
  );
}