"use client";

import { useRef, useCallback, useMemo } from "react";
import { TrendPoint } from "@/lib/timerAnalytics";
import type { Solve } from "@/hooks/useTimerStore";

interface TimerGraphProps {
  visibleTrendPoints: TrendPoint[];
  showTimeLine: boolean;
  showAo5Line: boolean;
  showAo12Line: boolean;
  chartSize: { w: number; h: number };
  graphData: { minVal: number; maxVal: number; range: number } | null;
  displaySolves: Solve[];
  hoveredPoint: number | null;
  onHoverPoint: (index: number | null) => void;
}

export function TimerGraph({
  visibleTrendPoints,
  showTimeLine,
  showAo5Line,
  showAo12Line,
  chartSize,
  graphData,
  displaySolves,
  hoveredPoint,
  onHoverPoint,
}: TimerGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleGraphMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || visibleTrendPoints.length === 0) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    
    const PADDING_LEFT = 40;
    const PADDING_RIGHT = 10;
    const innerWidth = Math.max(10, svgRect.width - PADDING_LEFT - PADDING_RIGHT);

    const mouseX = e.clientX - svgRect.left;
    const ratio = Math.max(0, Math.min(1, (mouseX - PADDING_LEFT) / innerWidth));
    const index = Math.round(ratio * (visibleTrendPoints.length - 1));
    onHoverPoint(index);
  }, [visibleTrendPoints.length, onHoverPoint]);

  const renderGraphLines = () => {
    if (!graphData || visibleTrendPoints.length === 0) return null;
    const { minVal, range } = graphData;

    const PADDING = { top: 10, right: 10, bottom: 25, left: 40 };
    const innerWidth = Math.max(10, chartSize.w - PADDING.left - PADDING.right);
    const innerHeight = Math.max(10, chartSize.h - PADDING.top - PADDING.bottom);

    const mapX = (index: number) => PADDING.left + (index / Math.max(visibleTrendPoints.length - 1, 1)) * innerWidth;
    const mapY = (val: number) => PADDING.top + ((graphData.maxVal - val) / range) * innerHeight;

    const getPoints = (series: 'time' | 'ao5' | 'ao12') => {
      const values = visibleTrendPoints.map((p, i) => {
        let val = null;
        if (series === 'time') val = p.timeSeconds;
        if (series === 'ao5') val = p.ao5Seconds;
        if (series === 'ao12') val = p.ao12Seconds;
        
        if (val === null) return null;
        return `${mapX(i)},${mapY(val)}`;
      }).filter(Boolean);
      return values.join(' ');
    };

    return (
      <svg 
        ref={svgRef}
        viewBox={`0 0 ${chartSize.w} ${chartSize.h}`} 
        className="h-full w-full cursor-crosshair overflow-visible block" 
        onMouseMove={handleGraphMouseMove}
        onMouseLeave={() => onHoverPoint(null)}
      >
        {/* Y Axis Guides */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const val = minVal + ratio * range;
          const y = mapY(val);
          return (
            <g key={`y-${ratio}`}>
              <line x1={PADDING.left} y1={y} x2={chartSize.w - PADDING.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
              <text x={PADDING.left - 8} y={y + 4} fontSize="11" fill="#9ca3af" textAnchor="end" className="font-mono select-none">{val.toFixed(1)}s</text>
            </g>
          );
        })}
        
        {/* X Axis Guides */}
        {[0, 0.5, 1].map((ratio) => {
          if (visibleTrendPoints.length < 2) return null;
          const idx = Math.floor(ratio * (visibleTrendPoints.length - 1));
          const x = mapX(idx);
          const solveNumber = displaySolves.length - visibleTrendPoints.length + idx + 1;
          return (
            <text key={`x-${ratio}`} x={x} y={chartSize.h - 5} fontSize="11" fill="#9ca3af" textAnchor="middle" className="font-mono select-none">#{solveNumber}</text>
          );
        })}

        {/* Axis Base Lines */}
        <line x1={PADDING.left} y1={chartSize.h - PADDING.bottom} x2={chartSize.w - PADDING.right} y2={chartSize.h - PADDING.bottom} stroke="#d1d5db" strokeWidth="2" />
        <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={chartSize.h - PADDING.bottom} stroke="#d1d5db" strokeWidth="2" />

        {/* Data Polylines */}
        {showTimeLine && <polyline fill="none" stroke="#94a3b8" strokeWidth="2" points={getPoints('time')} strokeLinejoin="round" />}
        {showAo5Line && <polyline fill="none" stroke="#ef4444" strokeWidth="3" points={getPoints('ao5')} strokeLinejoin="round" />}
        {showAo12Line && <polyline fill="none" stroke="#3b82f6" strokeWidth="3" points={getPoints('ao12')} strokeLinejoin="round" />}

        {/* Hover State Renderer */}
        {hoveredPoint !== null && visibleTrendPoints[hoveredPoint] && (
          <g>
            <line 
              x1={mapX(hoveredPoint)} 
              y1={PADDING.top} 
              x2={mapX(hoveredPoint)} 
              y2={chartSize.h - PADDING.bottom} 
              stroke="#cbd5e1" 
              strokeWidth="1" 
              strokeDasharray="4 4" 
            />
            {showTimeLine && visibleTrendPoints[hoveredPoint].timeSeconds && (
              <circle cx={mapX(hoveredPoint)} cy={mapY(visibleTrendPoints[hoveredPoint].timeSeconds!)} r="4" fill="#94a3b8" />
            )}
            {showAo5Line && visibleTrendPoints[hoveredPoint].ao5Seconds && (
              <circle cx={mapX(hoveredPoint)} cy={mapY(visibleTrendPoints[hoveredPoint].ao5Seconds!)} r="4" fill="#ef4444" />
            )}
            {showAo12Line && visibleTrendPoints[hoveredPoint].ao12Seconds && (
              <circle cx={mapX(hoveredPoint)} cy={mapY(visibleTrendPoints[hoveredPoint].ao12Seconds!)} r="4" fill="#3b82f6" />
            )}
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="flex-1 w-full pt-4 min-h-0 relative">
      {visibleTrendPoints.length > 0 ? renderGraphLines() : (
        <div className="absolute inset-0 flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-sm text-slate-400 bg-slate-50">
          Solve a few times to see your trend chart.
        </div>
      )}
    </div>
  );
}
