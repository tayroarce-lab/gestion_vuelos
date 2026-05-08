import { useState, useCallback, useEffect } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => {
      const next = [...prev, { id, type, message }];
      // Máximo 3 toasts simultáneos (FIFO)
      return next.length > 3 ? next.slice(next.length - 3) : next;
    });
    // Auto-dismiss después de 3.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Escuchar evento global 'toast:error' del api client
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      add('error', detail);
    };
    window.addEventListener('toast:error', handler);
    return () => window.removeEventListener('toast:error', handler);
  }, [add]);

  return { toasts, add, remove };
}
