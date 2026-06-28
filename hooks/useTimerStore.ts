import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Solve {
  id: string;
  sessionId: string; 
  time: number;
  scramble: string;
  penalty?: '+2' | 'DNF';
  createdAt: number;
}

export interface Session {
  id: string;
  name: string;
}

interface TimerState {
  sessions: Session[];
  activeSessionId: string;
  solves: Solve[];
  

  addSession: (name: string) => void;
  setActiveSession: (id: string) => void;
  renameSession: (id: string, name: string) => void;
  deleteSession: (id: string) => void;
  
  addSolve: (solve: Omit<Solve, 'id' | 'sessionId' | 'createdAt'>) => void;
  deleteSolve: (id: string) => void;
  togglePenalty: (id: string, penalty: '+2' | 'DNF') => void;
  clearActiveSession: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      sessions: [{ id: 'default-session', name: 'Session 1' }],
      activeSessionId: 'default-session',
      solves: [],

      addSession: (name) => set((state) => {
        const newSession = { id: crypto.randomUUID(), name };
        return { 
          sessions: [...state.sessions, newSession],
          activeSessionId: newSession.id 
        };
      }),

      setActiveSession: (id) => set({ activeSessionId: id }),

      renameSession: (id, name) => set((state) => ({
        sessions: state.sessions.map(s => s.id === id ? { ...s, name } : s)
      })),

      deleteSession: (id) => set((state) => {
        if (state.sessions.length <= 1) return state;
        const newSessions = state.sessions.filter(s => s.id !== id);
        return {
          sessions: newSessions,
          activeSessionId: newSessions[0].id,
          solves: state.solves.filter(s => s.sessionId !== id)
        };
      }),

      addSolve: (solve) => set((state) => ({ 
        solves: [
          ...state.solves, 
          { 
            ...solve, 
            id: crypto.randomUUID(), 
            sessionId: state.activeSessionId,
            createdAt: Date.now() 
          }
        ] 
      })),

      deleteSolve: (id) => set((state) => ({
        solves: state.solves.filter(s => s.id !== id)
      })),

      togglePenalty: (id, penalty) => set((state) => ({
        solves: state.solves.map(s => s.id === id ? { 
          ...s, 
          penalty: s.penalty === penalty ? undefined : penalty 
        } : s)
      })),

      clearActiveSession: () => set((state) => ({
        solves: state.solves.filter(s => s.sessionId !== state.activeSessionId)
      })),
    }),
    { name: 'rubik-timer-v3' } 
  )
);