"use client";

import { Algorithm, Category } from "@/lib/types";
import { useCubeStore } from "@/hooks/useCubeStore";
import { GripVertical } from "lucide-react";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DraggableAlgorithmListProps {
  algorithms: Algorithm[];
  category: Category;
  onAlgorithmOrderChange?: (category: Category, orderedIds: string[]) => void;
}

export function DraggableAlgorithmList({
  algorithms,
  category,
  onAlgorithmOrderChange,
}: DraggableAlgorithmListProps) {
  const algorithmOrder = useCubeStore((state) => state.algorithmOrder);
  const setAlgorithmOrder = useCubeStore((state) => state.setAlgorithmOrder);

  // Sort algorithms based on custom order if available
  const orderedIds = algorithmOrder[category];
  let sortedAlgorithms: Algorithm[];
  
  if (orderedIds && orderedIds.length > 0) {
    // Use custom order
    const idToAlg = new Map(algorithms.map(alg => [alg.id, alg]));
    sortedAlgorithms = orderedIds
      .map(id => idToAlg.get(id))
      .filter((alg): alg is Algorithm => alg !== undefined);
    
    // Add any algorithms not in custom order at the end
    const customIds = new Set(orderedIds);
    const remainingAlgs = algorithms.filter(alg => !customIds.has(alg.id));
    sortedAlgorithms = [...sortedAlgorithms, ...remainingAlgs];
  } else {
    // Use default order - for OLL, sort by number in name
    if (category === 'OLL') {
      sortedAlgorithms = [...algorithms].sort((a, b) => {
        const aNum = parseInt(a.name_en.replace(/\D/g, ''), 10);
        const bNum = parseInt(b.name_en.replace(/\D/g, ''), 10);
        return aNum - bNum;
      });
    } else {
      // For other categories, use default order
      sortedAlgorithms = [...algorithms];
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = sortedAlgorithms.findIndex(alg => alg.id === active.id);
      const newIndex = sortedAlgorithms.findIndex(alg => alg.id === over.id);
      
      const newOrderedIds = sortedAlgorithms.map(alg => alg.id);
      newOrderedIds.splice(oldIndex, 1);
      newOrderedIds.splice(newIndex, 0, active.id);
      
      setAlgorithmOrder(category, newOrderedIds);
      onAlgorithmOrderChange?.(category, newOrderedIds);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedAlgorithms}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {sortedAlgorithms.map((algorithm) => (
            <SortableAlgorithmItem
              key={algorithm.id}
              algorithm={algorithm}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableAlgorithmItem({ algorithm }: { algorithm: Algorithm }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: algorithm.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 cursor-grab active:cursor-grabbing ${
          isDragging
            ? 'border-indigo-500 shadow-lg opacity-50'
            : 'border-slate-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
        }`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <div className="flex-1">
          <div className="font-bold text-slate-900 dark:text-white text-sm">{algorithm.name_en}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{algorithm.notation}</div>
        </div>
        <div className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 rounded">
          {algorithm.difficulty}
        </div>
      </div>
    </div>
  );
}