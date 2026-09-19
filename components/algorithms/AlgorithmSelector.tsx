"use client";

import { useState } from "react";
import { Algorithm, Category } from "@/lib/types";
import type { Dictionary } from "@/lib/dictionary";
import { Check, X } from "lucide-react";
import { useCubeStore } from "@/hooks/useCubeStore";

interface AlgorithmSelectorProps {
  algorithms: Algorithm[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  dict?: Dictionary | null;
}

const CATEGORIES: Category[] = ['F2L', 'OLL', 'PLL'];

export function AlgorithmSelector({ algorithms, selectedIds, onSelectionChange, dict }: AlgorithmSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('PLL');

  const preferredNotations = useCubeStore((state) => state.preferredNotations);

  const filteredAlgs = algorithms.filter(alg => alg.category === activeCategory);
  const activeCategoryLabel = activeCategory === 'F2L'
    ? dict?.algorithms?.f2l || activeCategory
    : activeCategory === 'OLL'
      ? dict?.algorithms?.oll || activeCategory
      : dict?.algorithms?.pll || activeCategory;

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const selectCategory = (category: Category) => {
    const categoryIds = algorithms.filter(alg => alg.category === category).map(alg => alg.id);
    const newSelectedIds = [...new Set([...selectedIds, ...categoryIds])];
    onSelectionChange(newSelectedIds);
  };

  const deselectCategory = (category: Category) => {
    const categoryIds = algorithms.filter(alg => alg.category === category).map(alg => alg.id);
    const newSelectedIds = selectedIds.filter(id => !categoryIds.includes(id));
    onSelectionChange(newSelectedIds);
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const categorySelectedCount = (category: Category) => {
    return filteredAlgs.filter(alg => selectedIds.includes(alg.id)).length;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">{dict?.trainer?.select_algorithms_title || dict?.algorithms?.title || 'Select Algorithms'}</h3>
            <p className="text-indigo-200 dark:text-indigo-300 text-xs sm:text-sm">{dict?.trainer?.choose_algorithms || dict?.algorithms?.description || 'Choose algorithms to practice'}</p>
          </div>
          <div className="bg-white/20 dark:bg-white/10 px-3 sm:px-4 py-2 rounded-lg">
            <span className="text-white font-bold text-sm">{selectedIds.length} {dict?.algorithms?.selected_count || 'selected'}</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-slate-50 dark:bg-gray-700 px-4 sm:px-6 pt-3 sm:pt-4 border-b border-slate-200 dark:border-gray-600">
        <div className="flex gap-2 sm:gap-4 mb-3 sm:mb-4 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-2 sm:pb-3 px-2 text-xs sm:text-sm font-bold uppercase tracking-wide border-b-2 transition-colors relative whitespace-nowrap ${
                activeCategory === cat
                  ? "border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {cat}
              {categorySelectedCount(cat) > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-indigo-600 dark:bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center">
                  {categorySelectedCount(cat)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Category Actions */}
        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
          <button
            onClick={() => selectCategory(activeCategory)}
            className="text-xs font-semibold px-2 sm:px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
          >
            {(dict?.algorithms?.select_all || 'Select All') + ' ' + activeCategoryLabel}
          </button>
          <button
            onClick={() => deselectCategory(activeCategory)}
            className="text-xs font-semibold px-2 sm:px-3 py-1 bg-slate-100 dark:bg-gray-600 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-gray-500 transition-colors"
          >
            {(dict?.algorithms?.clear_selection || 'Deselect All') + ' ' + activeCategoryLabel}
          </button>
          <button
            onClick={clearAll}
            className="text-xs font-semibold px-2 sm:px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors ml-auto"
          >
            {dict?.algorithms?.clear_selection || 'Clear All'}
          </button>
        </div>
      </div>

      {/* Algorithm List */}
      <div className="max-h-80 sm:max-h-96 overflow-y-auto p-3 sm:p-4 space-y-2">
        {filteredAlgs.length === 0 ? (
          <div className="text-center text-slate-400 dark:text-slate-500 py-6 sm:py-8">
            {dict?.algorithms?.no_algorithms ? `${dict.algorithms.no_algorithms} ${activeCategoryLabel}` : `No algorithms in ${activeCategory}`}
          </div>
        ) : (
          filteredAlgs.map((alg) => {
            const isSelected = selectedIds.includes(alg.id);
            return (
              <button
                key={alg.id}
                onClick={() => toggleSelection(alg.id)}
                className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-gray-600'
                  }`}>
                    {isSelected ? (
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    ) : (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white dark:bg-gray-400 rounded-full" />
                    )}
                  </div>
                  <div className="text-left flex-grow">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{alg.name_en}</div>
                    <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono">{preferredNotations[alg.id] || alg.notation}</div>
                  </div>
                </div>
                <div className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 rounded flex-shrink-0">
                  {alg.difficulty}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
