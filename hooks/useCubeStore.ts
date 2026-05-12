import { create } from 'zustand';
import { persist } from 'zustand/middleware'; 

interface CubeState {
  algorithmQueue: string[];
  isPlaying: boolean;
  learnedAlgs: string[]; // 2. 

  setAlgorithm: (notation: string) => void;
  clearQueue: () => void;
  setPlaying: (status: boolean) => void;
  toggleLearned: (id: string) => void; 
}

export const useCubeStore = create<CubeState>()(
  persist(
    (set) => ({
      algorithmQueue: [],
      isPlaying: false,
      learnedAlgs: [], 

      setAlgorithm: (notation: string) => {
        const moves = notation.trim().split(/\s+/);
        set({ algorithmQueue: moves, isPlaying: true });
      },
      
      clearQueue: () => set({ algorithmQueue: [], isPlaying: false }),
      setPlaying: (status: boolean) => set({ isPlaying: status }),
      
      toggleLearned: (id: string) => set((state) => {
        const isLearned = state.learnedAlgs.includes(id);
        return {
          learnedAlgs: isLearned 
            ? state.learnedAlgs.filter(algId => algId !== id)
            : [...state.learnedAlgs, id]
        };
      }),
    }),
    {
      name: 'cube-progress-storage', 
    }
  )
);