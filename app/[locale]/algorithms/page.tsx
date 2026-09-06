"use client";

import { useState, useEffect, use } from "react";
import { getDictionary, type Dictionary } from "@/lib/dictionary";
import { supabase } from "@/lib/supabase";
import { Algorithm, Category } from "@/lib/types";
import CubeScene from "@/components/cube/CubeScene";
import AlgorithmCard from "@/components/algorithms/AlgorithmCard";
import { useCubeStore } from "@/hooks/useCubeStore";
import { AlgorithmPracticeStats } from "@/lib/types";
import { SearchInput } from "@/components/ui/SearchInput";

// Helper function to get user ID
function getUserId(): string {
  if (typeof window === 'undefined') return '00000000-0000-0000-0000-000000000001';
  
  const session = localStorage.getItem('sb-rubik-platform-auth-token');
  if (session) {
    try {
      const parsed = JSON.parse(session);
      return parsed.user?.id || '00000000-0000-0000-0000-000000000001';
    } catch {
      return '00000000-0000-0000-0000-000000000001';
    }
  }
  
  return '00000000-0000-0000-0000-000000000001';
}

export default function AlgorithmsPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale as 'en' | 'vi';

  const [activeTab, setActiveTab] = useState<Category>('PLL');
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<Record<string, AlgorithmPracticeStats>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const learnedAlgs = useCubeStore((state) => state.learnedAlgs);

  useEffect(() => {
    setMounted(true); 
    async function loadData() {
      try {
        const d = await getDictionary(locale);
        setDict(d);

        // Fetch algorithms from API
        const response = await fetch('/api/algorithms');
        if (!response.ok) {
          throw new Error('Failed to fetch algorithms');
        }
        const data: Algorithm[] = await response.json();
        setAlgorithms(data);

        const userId = getUserId();
        const statsResponse = await fetch(`/api/algorithm-stats?userId=${userId}`);
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

  if (loading || !dict) return <div className="p-20 text-center font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-gray-900 min-h-screen">Loading Dictionary...</div>;

  const categories: Category[] = ['F2L', 'OLL', 'PLL'];
  const filteredAlgs = algorithms
    .filter(alg => alg.category === activeTab)
    .filter(alg => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        alg.name_en.toLowerCase().includes(query) ||
        alg.name_vi.toLowerCase().includes(query) ||
        alg.notation.toLowerCase().includes(query)
      );
    });

  const totalInTab = filteredAlgs.length;
  const learnedInTab = mounted 
    ? filteredAlgs.filter(alg => learnedAlgs.includes(alg.id)).length 
    : 0;
  const progressPercentage = totalInTab === 0 ? 0 : Math.round((learnedInTab / totalInTab) * 100);

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-8 bg-white dark:bg-gray-900 min-h-screen">
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      <section className="mb-8 sm:mb-16 grid lg:grid-cols-2 gap-6 sm:gap-12 items-center bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-gray-700 shadow-sm">
        <div className="order-2 lg:order-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-2 sm:mb-4">{dict.algorithms.title}</h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{dict.algorithms.description}</p>
        </div>
        <div className="order-1 lg:order-2">
          <CubeScene />
        </div>
      </section>

      <div className="flex flex-col gap-4 mb-6 sm:mb-8 border-b border-slate-200 dark:border-gray-700 pb-4 sm:pb-8 bg-slate-50/50 dark:bg-gray-800/50">
        
        <div className="flex gap-4 sm:gap-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`pb-2 sm:pb-4 text-xs sm:text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === cat 
                  ? "border-b-4 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400" 
                  : "border-b-4 border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {dict.algorithms[cat.toLowerCase() as keyof typeof dict.algorithms] as string || cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={dict.algorithms.search_placeholder}
            className="w-full"
          />

          <div className="flex flex-col w-full sm:w-auto">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              {dict.algorithms.mastery}: <span className="text-indigo-600 dark:text-indigo-400">{learnedInTab} / {totalInTab}</span> ({progressPercentage}%)
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden border border-slate-200/60 dark:border-gray-600 shadow-inner">
              <div 
                className="h-full bg-emerald-500 transition-all duration-700 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {filteredAlgs.map((alg) => (
          <AlgorithmCard
            key={alg.id}
            alg={alg}
            locale={locale as 'en' | 'vi'}
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
          <div className="p-6 sm:p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            {dict.algorithms.no_algorithms}
          </div>
        )}
      </div>
    </main>
  );
}