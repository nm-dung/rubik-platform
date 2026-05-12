import { create } from 'zustand';

interface CubeState {
  // Turn "R U R'" into an array: ["R", "U", "R'"] so the 3D engine can play them one by one
  algorithmQueue: string[]; 
  isPlaying: boolean;
  
  // Actions
  setAlgorithm: (notation: string) => void;
  clearQueue: () => void;
  setPlaying: (status: boolean) => void;
}

export const useCubeStore = create<CubeState>((set) => ({
  algorithmQueue: [],
  isPlaying: false,

  setAlgorithm: (notation: string) => {
    const moves = notation.trim().split(/\s+/);
    set({ algorithmQueue: moves, isPlaying: true });
  },
  
  clearQueue: () => set({ algorithmQueue: [], isPlaying: false }),
  setPlaying: (status: boolean) => set({ isPlaying: status }),
}));