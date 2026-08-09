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
      <div className={`text-sm sm:text-lg md:text-2xl lg:text-4xl font-mono font-bold text-center text-slate-700 max-w-4xl tracking-wide mb-8 sm:mb-12 md:mb-16 lg:mb-24 transition-all duration-300 break-all leading-tight px-4 ${timerState === 'solving' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {currentScramble}
      </div>

      <div className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[8rem] 2xl:text-[12rem] font-black font-mono leading-none tracking-tighter transition-all duration-150 ${getTimerColor()} ${
        timerState === 'solving' ? 'animate-pulse' : ''
      }`}>
        {(timerState === 'inspecting' || (timerState === 'ready' && isHoldingForSolve)) ? (
           <span className="animate-pulse">{inspectionTime > 0 ? inspectionTime : inspectionTime > -2 ? '+2' : 'DNF'}</span>
        ) : formatTime(time)}
      </div>

      <div className={`absolute bottom-16 sm:bottom-20 md:bottom-24 lg:bottom-32 text-slate-400 font-bold uppercase tracking-widest transition-all duration-300 text-[10px] sm:text-xs md:text-sm ${timerState === 'solving' ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        {timerState === 'inspecting' || isHoldingForSolve ? 'Touch or hold Space to start solve' : 'Touch or hold Space to start'}
      </div>
    </>
  );
}
