"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle2 } from "lucide-react";
import { parseAlgorithm, Move } from "@/lib/notationParser";
import { useStreaks } from "@/hooks/useStreaks";

interface AlgorithmPracticeProps {
  notation: string;
  algorithmName: string;
  onComplete?: () => void;
}

export function AlgorithmPractice({ notation, algorithmName, onComplete }: AlgorithmPracticeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { updateStreak } = useStreaks();

  const moves = parseAlgorithm(notation);
  const currentMove = moves[currentStep];
  const progress = ((currentStep + 1) / moves.length) * 100;

  const handleNext = () => {
    if (currentStep < moves.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
      updateStreak();
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setCompleted(false);
  };

  if (moves.length === 0) {
    return (
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
        <p className="text-slate-600">No algorithm notation provided</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white">Practice Mode</h3>
            <p className="text-indigo-200 text-sm">{algorithmName}</p>
          </div>
          {completed && (
            <div className="flex items-center gap-2 bg-emerald-500 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex justify-between text-xs text-slate-600 mb-2">
          <span>Step {currentStep + 1} of {moves.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Move Display */}
      <div className="p-8">
        <div className="text-center mb-8">
          <div className="inline-block bg-slate-900 rounded-2xl px-8 py-6 shadow-inner">
            <div className="text-6xl font-black text-indigo-400 tracking-wider mb-2">
              {currentMove.notation}
            </div>
            <div className="text-slate-400 text-sm uppercase tracking-widest">
              {currentMove.description}
            </div>
          </div>
        </div>

        {/* Move Sequence Overview */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {moves.map((move, index) => (
              <div
                key={index}
                className={`px-3 py-2 rounded-lg text-sm font-mono font-bold transition-all ${
                  index === currentStep
                    ? 'bg-indigo-600 text-white scale-110 shadow-lg'
                    : index < currentStep
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {move.notation}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl"
          >
            {currentStep === moves.length - 1 ? 'Complete' : 'Next'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
