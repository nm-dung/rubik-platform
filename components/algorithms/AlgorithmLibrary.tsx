"use client";

import { useState } from "react";
import { algorithmsData, Category } from "@/data/algorithms";
import AlgorithmCard from "./AlgorithmCard";

const CATEGORIES: Category[] = ['F2L', 'OLL', 'PLL'];

export default function AlgorithmLibrary() {
  const [activeCategory, setActiveCategory] = useState<Category>('PLL');

  const filteredAlgs = algorithmsData.filter(alg => alg.category === activeCategory);

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
        {filteredAlgs.length > 0 ? (
          filteredAlgs.map((alg) => (
            <AlgorithmCard key={alg.id} alg={alg} />
          ))
        ) : (
          <div className="text-center text-slate-400 py-10 font-medium">
            No algorithms added for {activeCategory} yet.
          </div>
        )}
      </div>

    </div>
  );
}