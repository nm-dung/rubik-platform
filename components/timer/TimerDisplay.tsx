"use client";

type TimerState = 'idle' | 'ready' | 'inspecting' | 'solving';

interface TimerDisplayProps {
  time: number;
  currentScramble: string;
  timerState: TimerState;
  inspectionTime: number;
  isHoldingForSolve: boolean;
  formatTime: (time: number) => string;
}

export function TimerDisplay({
  time,
  currentScramble,
  timerState,
  inspectionTime,
  isHoldingForSolve,
  formatTime,
}: TimerDisplayProps) {
  const getTimerColor = () => {
    if (timerState === 'ready') return 'text-emerald-500';
    if (timerState === 'inspecting') return 'text-red-500';
    return 'text-slate-800';
  };

  return (
    <>
      <div className={`text-lg sm:text-2xl md:text-4xl font-mono font-bold text-center text-slate-700 max-w-4xl tracking-wide mb-12 sm:mb-24 transition-opacity duration-200 break-all ${timerState === 'solving' ? 'opacity-0' : 'opacity-100'}`}>
        {currentScramble}
      </div>

      <div className={`text-5xl sm:text-7xl md:text-[8rem] lg:text-[12rem] font-black font-mono leading-none tracking-tighter transition-colors duration-150 ${getTimerColor()}`}>
        {(timerState === 'inspecting' || (timerState === 'ready' && isHoldingForSolve)) ? (
           <span>{inspectionTime > 0 ? inspectionTime : inspectionTime > -2 ? '+2' : 'DNF'}</span>
        ) : formatTime(time)}
      </div>

      <div className={`absolute bottom-20 sm:bottom-32 text-slate-400 font-bold uppercase tracking-widest transition-opacity duration-200 text-xs sm:text-sm ${timerState === 'solving' ? 'opacity-0' : 'opacity-100'}`}>
        {timerState === 'inspecting' || isHoldingForSolve ? 'Hold Space to start solve' : 'Hold Space to start'}
      </div>
    </>
  );
}
