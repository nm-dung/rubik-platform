import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Define what a Solve looks like now
export interface Solve {
  id: string;
  time: number;
  scramble: string;
  penalty?: '+2' | 'DNF'; // Optional penalty
}

interface TimerState {
  solves: Solve[];
  addSolve: (solve: Omit<Solve, 'id'>) => void;
  deleteSolve: (id: string) => void;
  togglePenalty: (id: string, penalty: '+2' | 'DNF') => void;
  clearSession: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      solves: [],
      
      // Auto-generate a random ID for every new solve
      addSolve: (solve) => set((state) => ({ 
        solves: [...state.solves, { ...solve, id: crypto.randomUUID() }] 
      })),
      
      deleteSolve: (id) => set((state) => ({
        solves: state.solves.filter(s => s.id !== id)
      })),
      
      togglePenalty: (id, penalty) => set((state) => ({
        solves: state.solves.map(s => {
          if (s.id !== id) return s;
          return { ...s, penalty: s.penalty === penalty ? undefined : penalty };
        })
      })),
      
      clearSession: () => set({ solves: [] }),
    }),
    {
      name: 'cstimer-v2-session', 
    }
  )
);