"use client";

import { useState, useEffect } from "react";
import { Category, Algorithm } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import AlgorithmCard from "./AlgorithmCard";

const CATEGORIES: Category[] = ['F2L', 'OLL', 'PLL'];

export default function AlgorithmLibrary() {
  const [activeCategory, setActiveCategory] = useState<Category>('PLL');
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchAlgorithms() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('algorithms')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) {
          setError(`Failed to load algorithms: ${supabaseError.message}`);
          console.error('Supabase error:', supabaseError);
        } else {
          setAlgorithms(data || []);
        }
      } catch (err) {
        setError('Failed to load algorithms');
        console.error('Error fetching algorithms:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAlgorithms();
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
            <AlgorithmCard key={alg.id} alg={alg} />
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