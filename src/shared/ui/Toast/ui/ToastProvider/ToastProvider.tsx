import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ToastContext } from '../../model/toastContext';
import type { ToastEntry, ToastExit, ToastOptions } from '../../model/toastContext';
import { ToastItem } from '../ToastItem';
import styles from './ToastProvider.module.css';

const EXIT_DURATION_MS = 320;
const MAX_ACTIVE_TOASTS = 3;

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const [heldId, setHeldId] = useState<number | null>(null);
  const nextId = useRef(0);
  const removeTimers = useRef(new Set<number>());

  const dismiss = useCallback((id: number, exit: ToastExit = 'down') => {
    setToasts((current) =>
      current.map((toast) =>
        toast.id === id && !toast.isClosing ? { ...toast, isClosing: true, exit } : toast,
      ),
    );

    const timer = window.setTimeout(() => {
      removeTimers.current.delete(timer);
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, EXIT_DURATION_MS);
    removeTimers.current.add(timer);

  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    nextId.current += 1;
    const entry: ToastEntry = { ...options, id: nextId.current, isClosing: false, exit: 'down' };
    setToasts((current) => [...current, entry]);
  }, []);

  const handleHoldChange = useCallback((id: number, isHeld: boolean) => {
    setHeldId((current) => (isHeld ? id : current === id ? null : current));
  }, []);

  useEffect(() => {
    const active = toasts.filter((toast) => !toast.isClosing);
    const oldest = active[0];
    if (oldest && active.length > MAX_ACTIVE_TOASTS) dismiss(oldest.id);
  }, [dismiss, toasts]);

  useEffect(() => {
    const timers = removeTimers.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  const activeToasts = toasts.filter((toast) => !toast.isClosing);
  const isPaused = heldId !== null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.viewport} role="region" aria-label="Сповіщення" aria-live="polite">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            depth={activeToasts.filter((item) => item.id > toast.id).length}
            isPaused={isPaused}
            onDismiss={dismiss}
            onHoldChange={handleHoldChange}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}