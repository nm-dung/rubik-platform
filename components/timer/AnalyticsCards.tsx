"use client";

import { GripVertical } from "lucide-react";
import { TimerGraph } from "./TimerGraph";
import { TrendPoint } from "@/lib/timerAnalytics";
import type { Solve } from "@/hooks/useTimerStore";

interface AnalyticsCardsProps {
  analytics: {
    consistencyLabel: string;
    improvementLabel: string;
  };
  showTimeLine: boolean;
  showAo5Line: boolean;
  showAo12Line: boolean;
  analyticsRange: number | 'all';
  visibleTrendPoints: TrendPoint[];
  chartSize: { w: number; h: number };
  graphData: { minVal: number; maxVal: number; range: number } | null;
  displaySolves: Solve[];
  hoveredPoint: number | null;
  onShowTimeLineChange: (show: boolean) => void;
  onShowAo5LineChange: (show: boolean) => void;
  onShowAo12LineChange: (show: boolean) => void;
  onAnalyticsRangeChange: (range: number | 'all') => void;
  onHoverPoint: (index: number | null) => void;
  onChartRef: (node: HTMLDivElement | null) => void;
}

export function AnalyticsCards({
  analytics,
  showTimeLine,
  showAo5Line,
  showAo12Line,
  analyticsRange,
  visibleTrendPoints,
  chartSize,
  graphData,
  displaySolves,
  hoveredPoint,
  onShowTimeLineChange,
  onShowAo5LineChange,
  onShowAo12LineChange,
  onAnalyticsRangeChange,
  onHoverPoint,
  onChartRef,
}: AnalyticsCardsProps) {
  const cards: Record<string, React.ReactNode> = {
    summary: (
      <div key="summary" className="shrink-0 flex items-center justify-between gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 cursor-move">
        <div className="flex items-center gap-3">
          <GripVertical size={14} className="text-slate-300 dark:text-slate-500" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Consistency</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{analytics.consistencyLabel}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500 block">Trend</span>
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{analytics.improvementLabel}</span>
        </div>
      </div>
    ),
    controls: (
      <div key="controls" className="shrink-0 flex flex-col gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 cursor-move">
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-slate-300 dark:text-slate-500 flex-shrink-0" />
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={showTimeLine} 
                  onChange={e => onShowTimeLineChange(e.target.checked)} 
                  className="accent-slate-500 dark:accent-slate-400 w-3.5 h-3.5" 
                />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500 inline-block" /> Time
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={showAo5Line} 
                  onChange={e => onShowAo5LineChange(e.target.checked)} 
                  className="accent-red-500 dark:accent-red-400 w-3.5 h-3.5" 
                />
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 dark:bg-red-400 inline-block" /> Ao5
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={showAo12Line} 
                  onChange={e => onShowAo12LineChange(e.target.checked)} 
                  className="accent-blue-500 dark:accent-blue-400 w-3.5 h-3.5" 
                />
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-blue-400 inline-block" /> Ao12
              </label>
            </div>
            
            <select
              value={analyticsRange}
              onChange={(e) => onAnalyticsRangeChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="rounded-lg border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value={50}>Last 50</option>
              <option value={100}>Last 100</option>
              <option value={500}>Last 500</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
      </div>
    ),
    chart: (
      <div key="chart" className="relative p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 cursor-move flex-1 min-h-[120px] flex flex-col overflow-hidden w-full h-full">
        <div className="absolute top-2 left-2 cursor-move z-10"><GripVertical size={14} className="text-slate-300 dark:text-slate-500" /></div>
        
        {hoveredPoint !== null && visibleTrendPoints[hoveredPoint] && (
          <div className="absolute top-2 right-2 bg-slate-800 dark:bg-gray-900 text-white dark:text-gray-100 text-[11px] font-mono p-2 rounded-lg shadow-lg z-20 pointer-events-none whitespace-nowrap min-w-[120px]">
            <div className="text-slate-400 dark:text-slate-500 mb-1 pb-1 border-b border-slate-600 dark:border-gray-700 flex justify-between">
              <span>Solve #{displaySolves.length - visibleTrendPoints.length + hoveredPoint + 1}</span>
              <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            {showTimeLine && visibleTrendPoints[hoveredPoint].timeSeconds && <div>Time: <span className="font-bold">{visibleTrendPoints[hoveredPoint].timeSeconds?.toFixed(2)}</span></div>}
            {showAo5Line && visibleTrendPoints[hoveredPoint].ao5Seconds && <div>Ao5: <span className="font-bold text-red-400 dark:text-red-300">{visibleTrendPoints[hoveredPoint].ao5Seconds?.toFixed(2)}</span></div>}
            {showAo12Line && visibleTrendPoints[hoveredPoint].ao12Seconds && <div>Ao12: <span className="font-bold text-blue-400 dark:text-blue-300">{visibleTrendPoints[hoveredPoint].ao12Seconds?.toFixed(2)}</span></div>}
          </div>
        )}

        <div ref={onChartRef} className="flex-1 min-h-0 w-full h-full relative" style={{ minHeight: '200px' }} data-chart-container>
          <TimerGraph
            visibleTrendPoints={visibleTrendPoints}
            showTimeLine={showTimeLine}
            showAo5Line={showAo5Line}
            showAo12Line={showAo12Line}
            chartSize={chartSize}
            graphData={graphData}
            displaySolves={displaySolves}
            hoveredPoint={hoveredPoint}
            onHoverPoint={onHoverPoint}
          />
        </div>
      </div>
    )
  };

  return cards;
}
