import { createContext } from 'react';

export interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

export type ToastExit = 'down' | 'left' | 'right';

export interface ToastEntry extends ToastOptions {
  id: number;
  isClosing: boolean;
  exit: ToastExit;
}

export interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);