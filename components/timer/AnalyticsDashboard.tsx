"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { GripVertical, Maximize2, Minimize2, X } from "lucide-react";
import { TrendPoint } from "@/lib/timerAnalytics";

interface AnalyticsDashboardProps {
  show: boolean;
  isFullscreen: boolean;
  position: { x: number; y: number };
  isDragging: boolean;
  cardOrder: string[];
  analyticsCards: Record<string, React.ReactNode>;
  timerState: 'idle' | 'ready' | 'inspecting' | 'solving';
  onClose: () => void;
  onToggleFullscreen: () => void;
  onStartDrag: (e: React.MouseEvent) => void;
  onCardOrderChange: (newOrder: string[]) => void;
}

export function AnalyticsDashboard({
  show,
  isFullscreen,
  position,
  isDragging,
  cardOrder,
  analyticsCards,
  timerState,
  onClose,
  onToggleFullscreen,
  onStartDrag,
  onCardOrderChange,
}: AnalyticsDashboardProps) {
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  const handleDragStart = (id: string) => setDraggedCard(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedCard || draggedCard === id) return;
    const draggedIdx = cardOrder.indexOf(draggedCard);
    const targetIdx = cardOrder.indexOf(id);
    const newOrder = [...cardOrder];
    newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIdx, 0, draggedCard);
    onCardOrderChange(newOrder);
  };
  const handleDrop = () => {
    setDraggedCard(null);
    localStorage.setItem('analyticsCardOrder', JSON.stringify(cardOrder));
  };



  if (!show) return null;

  return (
    <div 
      style={isFullscreen ? {} : { left: position.x, top: position.y }}
      className={`
        transition-opacity duration-200 flex flex-col bg-slate-50/90 backdrop-blur-md shadow-2xl z-[100]
        ${timerState === 'solving' ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        ${isFullscreen 
          ? 'fixed inset-0 !w-full !h-full rounded-none m-0 top-0 left-0 border-0 p-4' 
          : 'absolute w-[360px] h-[450px] border border-slate-200 rounded-2xl resize overflow-hidden min-w-[320px] min-h-[350px] pb-1 pr-1'}
      `}
    >
      {/* Widget Header */}
      <div 
        className={`flex items-center justify-between px-4 py-3 border-b border-slate-200/50 shrink-0 ${isFullscreen ? '' : 'cursor-move active:cursor-grabbing'}`}
        onMouseDown={onStartDrag}
      >
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pointer-events-none">
          Analytics Dashboard
        </span>
        <div className="flex items-center gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
          <button 
            onClick={onToggleFullscreen} 
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded transition-colors"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Inner Wrapper */}
      <div className={`p-3 flex flex-col gap-3 flex-1 min-h-0 ${isFullscreen ? 'overflow-hidden h-full' : 'overflow-y-auto'}`}>
        {cardOrder.map(id => {
          const card = analyticsCards[id];
          if (!card) return null;
          return (
            <div 
              key={id}
              draggable
              onDragStart={() => handleDragStart(id)}
              onDragOver={(e) => handleDragOver(e, id)}
              onDrop={handleDrop}
              className={id === 'chart' ? 'flex-1 min-h-0 w-full h-full' : ''}
              style={id === 'chart' && isFullscreen ? { minHeight: '400px' } : {}}
            >
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}
