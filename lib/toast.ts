/**
 * Toast Notification System
 */

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message, duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, duration }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  clearAll: () => {
    set({ toasts: [] });
  },
}));

// Convenience helpers
export function showSuccess(message: string) {
  useToastStore.getState().addToast('success', message);
}

export function showError(message: string) {
  useToastStore.getState().addToast('error', message);
}

export function showInfo(message: string) {
  useToastStore.getState().addToast('info', message);
}

export function showWarning(message: string) {
  useToastStore.getState().addToast('warning', message);
}
