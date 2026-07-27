"use client";

import { useState, useEffect } from "react";
import { Category, Algorithm, AlgorithmPracticeStats } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import AlgorithmCard from "./AlgorithmCard";

const CATEGORIES: Category[] = ['F2L', 'OLL', 'PLL'];

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
        const userId = getUserId();
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
    <div className="w-full max-w-3xl mx-auto bg-slate-50 rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[600px]">

      <div className="bg-white px-6 pt-6 border-b border-slate-200">
        <h2 className="text-2xl font-black text-slate-800 mb-4">Algorithm Library</h2>
        <div className="flex gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-3 px-2 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${
                activeCategory === cat
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {loading && (
          <div className="text-center text-slate-400 py-10 font-medium">
            Loading algorithms...
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        {!loading && !error && filteredAlgs.length > 0 ? (
          filteredAlgs.map((alg) => (
            <AlgorithmCard key={alg.id} alg={alg} stats={stats[alg.id]} />
          ))
        ) : !loading && !error ? (
          <div className="text-center text-slate-400 py-10 font-medium">
            No algorithms added for {activeCategory} yet.
          </div>
        ) : null}
      </div>

    </div>
  );
}