"use client";

import { useState, useEffect, use } from "react"; 
import { getDictionary } from "@/lib/dictionary";
import { supabase } from "@/lib/supabase";
import { Algorithm, Category } from "@/lib/types";
import CubeScene from "@/components/cube/CubeScene";
import AlgorithmCard from "@/components/algorithms/AlgorithmCard"; 
import { useCubeStore } from "@/hooks/useCubeStore";
import { AlgorithmPracticeStats } from "@/lib/types";

const PRACTICE_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function AlgorithmsPage({ params }: { params: Promise<{ locale: 'en' | 'vi' }> }) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;

  const [activeTab, setActiveTab] = useState<Category>('PLL');
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [dict, setDict] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<Record<string, AlgorithmPracticeStats>>({});

  const learnedAlgs = useCubeStore((state) => state.learnedAlgs);

  useEffect(() => {
    setMounted(true); 
    async function loadData() {
      try {
        const d = await getDictionary(locale);
        setDict(d);

        if (!supabase) {
          setError('Supabase is not configured');
          return;
        }

        const { data, error: supabaseError } = await supabase
          .from('algorithms')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (supabaseError) {
          setError(`Failed to load algorithms: ${supabaseError.message}`);
          console.error("Supabase error:", supabaseError);
        } else {
          setAlgorithms(data || []);
        }

        const statsResponse = await fetch(`/api/algorithm-stats?userId=${PRACTICE_USER_ID}`);
        if (statsResponse.ok) {
          const statsData: AlgorithmPracticeStats[] = await statsResponse.json();
          const statsMap: Record<string, AlgorithmPracticeStats> = {};
          statsData.forEach(stat => {
            statsMap[stat.algorithm_id] = stat;
          });
          setStats(statsMap);
        }
      } catch (err) {
        setError('Failed to load algorithms');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [locale]); 

  if (loading || !dict) return <div className="p-20 text-center font-bold text-slate-400">Loading Dictionary...</div>;

  const categories: Category[] = ['F2L', 'OLL', 'PLL'];
  const filteredAlgs = algorithms.filter(alg => alg.category === activeTab);

  const totalInTab = filteredAlgs.length;
  const learnedInTab = mounted 
    ? filteredAlgs.filter(alg => learnedAlgs.includes(alg.id)).length 
    : 0;
  const progressPercentage = totalInTab === 0 ? 0 : Math.round((learnedInTab / totalInTab) * 100);

  return (
    <main className="max-w-5xl mx-auto p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      <section className="mb-16 grid lg:grid-cols-2 gap-12 items-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <CubeScene />
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">{dict.algorithms.title}</h1>
          <p className="text-lg text-slate-600 leading-relaxed">{dict.algorithms.description}</p>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-slate-200 gap-4">
        
        <div className="flex gap-8">
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

        <div className="pb-4 flex flex-col items-start sm:items-end w-full sm:w-auto">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            {activeTab} Mastery: <span className="text-indigo-600">{learnedInTab} / {totalInTab}</span> ({progressPercentage}%)
          </div>
          <div className="w-full sm:w-48 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 shadow-inner">
            <div 
              className="h-full bg-emerald-500 transition-all duration-700 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
      </div>

      <div className="grid gap-6">
        {filteredAlgs.map((alg) => (
          <AlgorithmCard
            key={alg.id}
            alg={alg}
            locale={locale}
            stats={stats[alg.id]}
            onStatsChange={(algorithmId, updatedStats) => {
              setStats((currentStats) => {
                const nextStats = { ...currentStats };
                if (updatedStats) {
                  nextStats[algorithmId] = updatedStats;
                } else {
                  delete nextStats[algorithmId];
                }
                return nextStats;
              });
            }}
          />
        ))}
        {filteredAlgs.length === 0 && (
          <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            No algorithms found for {activeTab} yet.
          </div>
        )}
      </div>
    </main>
  );
}