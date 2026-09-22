import { create } from 'zustand';
import { persist } from 'zustand/middleware'; 

interface CubeState {
  algorithmQueue: string[];
  isPlaying: boolean;
  learnedAlgs: string[]; // 2.
  learningAlgs: string[]; // New: algorithms currently being learned
  preferredNotations: Record<string, string>; // New: user's preferred notation for each algorithm ID
  algorithmOrder: Record<string, string[]>; // New: custom order of algorithms by category

  setAlgorithm: (notation: string) => void;
  clearQueue: () => void;
  setPlaying: (status: boolean) => void;
  toggleLearned: (id: string) => void;
  toggleLearning: (id: string) => void; // New: toggle learning status
  setPreferredNotation: (algorithmId: string, notation: string) => void; // New: set preferred notation
  setAlgorithmOrder: (category: string, orderedIds: string[]) => void; // New: set custom algorithm order
}

export const useCubeStore = create<CubeState>()(
  persist(
    (set) => ({
      algorithmQueue: [],
      isPlaying: false,
      learnedAlgs: [],
      learningAlgs: [], // New: algorithms currently being learned
      preferredNotations: {}, // New: user's preferred notation for each algorithm ID
      algorithmOrder: {}, // New: custom order of algorithms by category

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

      toggleLearning: (id: string) => set((state) => {
        const isLearning = state.learningAlgs.includes(id);
        return {
          learningAlgs: isLearning
            ? state.learningAlgs.filter(algId => algId !== id)
            : [...state.learningAlgs, id]
        };
      }),

      setPreferredNotation: (algorithmId: string, notation: string) => set((state) => ({
        preferredNotations: {
          ...state.preferredNotations,
          [algorithmId]: notation
        }
      })),

      setAlgorithmOrder: (category: string, orderedIds: string[]) => set((state) => ({
        algorithmOrder: {
          ...state.algorithmOrder,
          [category]: orderedIds
        }
      })),
    }),
    {
      name: 'cube-progress-storage',
    }
  )
);