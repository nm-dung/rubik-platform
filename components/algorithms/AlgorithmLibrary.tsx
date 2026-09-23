"use client";

import { useState, useEffect } from "react";
import { Category, Algorithm, AlgorithmPracticeStats } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import AlgorithmCard from "./AlgorithmCard";
import { getPracticeUserId } from "@/lib/practiceUser";

const CATEGORIES: Category[] = ['F2L', 'OLL', 'PLL'];

export default function AlgorithmLibrary() {
  const [activeCategory, setActiveCategory] = useState<Category>('PLL');
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [stats, setStats] = useState<Record<string, AlgorithmPracticeStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      try {
        if (!supabase) {
          setAlgorithms([]);
          setLoading(false);
          return;
        }

        // Fetch algorithms
        const { data: algData, error: algError } = await supabase
          .from('algorithms')
          .select('*')
          .order('created_at', { ascending: false });

        if (algError) {
          setError(`Failed to load algorithms: ${algError.message}`);
          console.error('Supabase error:', algError);
        } else {
          setAlgorithms(algData || []);
        }

        // Fetch practice stats using authenticated user ID
        const userId = await getPracticeUserId();
        const { data: statsData, error: statsError } = await supabase
          .from('algorithm_practice_stats')
          .select('*')
          .eq('user_id', userId);

        if (!statsError && statsData) {
          const statsMap: Record<string, AlgorithmPracticeStats> = {};
          statsData.forEach(stat => {
            statsMap[stat.algorithm_id] = stat;
          });
          setStats(statsMap);
        }
      } catch (err) {
        setError('Failed to load algorithms');
        console.error('Error fetching algorithms:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredAlgs = algorithms.filter(alg => alg.category === activeCategory);

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-50 rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[600px] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">

      <div className="bg-white px-6 pt-6 border-b border-slate-200">
        <h2 className="text-2xl font-black text-slate-800 mb-4">Algorithm Library</h2>
        <div className="flex gap-4">
          {CATEGORIES.map((cat, index) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-3 px-2 text-sm font-bold uppercase tracking-wide border-b-2 transition-all duration-300 hover:scale-110 relative ${
                activeCategory === cat
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {cat}
              {activeCategory === cat && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {loading && (
          <div className="text-center text-slate-400 py-10 font-medium animate-pulse">
            Loading algorithms...
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-shake">
            {error}
          </div>
        )}
        {!loading && !error && filteredAlgs.length > 0 ? (
          filteredAlgs.map((alg, index) => (
            <div 
              key={alg.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <AlgorithmCard key={alg.id} alg={alg} stats={stats[alg.id]} />
            </div>
          ))
        ) : !loading && !error ? (
          <div className="text-center text-slate-400 py-10 font-medium animate-fade-in">
            No algorithms added for {activeCategory} yet.
          </div>
        ) : null}
      </div>

    </div>
  );
}