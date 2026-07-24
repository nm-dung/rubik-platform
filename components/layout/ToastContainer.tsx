'use client';

/**
 * Toast UI Component
 */

import { useEffect } from 'react';
import { useToastStore } from '@/lib/toast';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: any; onClose: () => void }) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(onClose, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const bgColor = {
    success: 'bg-emerald-50 border-emerald-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-amber-50 border-amber-200',
  }[toast.type];

  const textColor = {
    success: 'text-emerald-700',
    error: 'text-red-700',
    info: 'text-blue-700',
    warning: 'text-amber-700',
  }[toast.type];

  const iconColor = {
    success: 'text-emerald-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    warning: 'text-amber-500',
  }[toast.type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${bgColor}`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
      <p className={`text-sm font-medium ${textColor} flex-1`}>{toast.message}</p>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ${textColor} hover:opacity-70 transition`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
