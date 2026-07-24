import { Solve } from '@/hooks/useTimerStore';

const formatTime = (time: number) => (time / 1000).toFixed(2);

const getNumericTime = (solve: Solve) => {
  if (solve.penalty === 'DNF') return Infinity;
  return solve.penalty === '+2' ? solve.time + 2000 : solve.time;
};

export interface TrendPoint {
  label: string;
  timeSeconds: number | null;
  ao5Seconds: number | null;
  ao12Seconds: number | null;
}

export interface TimerAnalyticsSummary {
  trendPoints: TrendPoint[];
  consistencyLabel: string;
  improvementLabel: string;
}

const getAverageForSlice = (solves: Solve[], count: number) => {
  if (solves.length < count) return null;
  const lastN = solves.slice(-count).map(getNumericTime);
  const dnfs = lastN.filter((value) => value === Infinity).length;
  if (dnfs > 1) return null;

  const sorted = [...lastN].sort((a, b) => a - b);
  const middle = sorted.slice(1, -1);
  if (middle.length === 0) {
    return lastN[0] === Infinity ? null : lastN[0];
  }

  return middle.reduce((sum, value) => sum + value, 0) / middle.length;
};

export function getTimerAnalytics(solves: Solve[]): TimerAnalyticsSummary {
  const values = solves
    .map((solve) => getNumericTime(solve))
    .filter((value) => Number.isFinite(value));

  const trendPoints = solves.map((solve, index) => {
    const prefix = solves.slice(0, index + 1);
    const latest = prefix[prefix.length - 1];
    const timeSeconds = getNumericTime(latest) === Infinity ? null : getNumericTime(latest) / 1000;
    const ao5Seconds = getAverageForSlice(prefix, 5) === null ? null : getAverageForSlice(prefix, 5)! / 1000;
    const ao12Seconds = getAverageForSlice(prefix, 12) === null ? null : getAverageForSlice(prefix, 12)! / 1000;

    return {
      label: `${index + 1}`,
      timeSeconds,
      ao5Seconds,
      ao12Seconds,
    };
  });

  let consistencyLabel = 'Add more solves';
  if (values.length >= 3) {
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const relativeSpread = (stdDev / avg) * 100;

    if (relativeSpread < 8) consistencyLabel = 'Very consistent';
    else if (relativeSpread < 15) consistencyLabel = 'Consistent';
    else if (relativeSpread < 25) consistencyLabel = 'Mixed';
    else consistencyLabel = 'Needs practice';
  }

  let improvementLabel = 'No trend yet';
  if (solves.length >= 6) {
    const midpoint = Math.floor(solves.length / 2);
    const firstHalf = solves.slice(0, midpoint).map(getNumericTime).filter(Number.isFinite);
    const secondHalf = solves.slice(midpoint).map(getNumericTime).filter(Number.isFinite);

    if (firstHalf.length >= 2 && secondHalf.length >= 2) {
      const firstAvg = firstHalf.reduce((sum, value) => sum + value, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, value) => sum + value, 0) / secondHalf.length;
      const delta = secondAvg - firstAvg;

      improvementLabel = delta < -1000 ? 'Improving quickly' : delta < 0 ? 'Improving' : 'Needs a reset';
    }
  }

  return {
    trendPoints,
    consistencyLabel,
    improvementLabel,
  };
}

export function formatTimerDuration(time: number) {
  return formatTime(time);
}
