import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useSwipeToDismiss } from '@/shared/lib/hooks/useSwipeToDismiss';
import type { ToastEntry, ToastExit } from '../../model/toastContext';
import { useToastTimer } from '../../model/useToastTimer';
import styles from './ToastItem.module.css';

const DEFAULT_DURATION_MS = 3000;

interface ToastItemProps {
  toast: ToastEntry;
  depth: number;
  isPaused: boolean;
  onDismiss: (id: number, exit?: ToastExit) => void;
  onHoldChange: (id: number, isHeld: boolean) => void;
}

export function ToastItem({ toast, depth, isPaused, onDismiss, onHoldChange }: ToastItemProps) {
  const { id, message, actionLabel, onAction, isClosing, exit } = toast;
  const duration = toast.duration ?? DEFAULT_DURATION_MS;

  const swipe = useSwipeToDismiss({ onDismiss: (direction) => onDismiss(id, direction) });
  const paused = isPaused || swipe.isHolding;

  const { secondsLeft } = useToastTimer({
    duration,
    isPaused: paused || isClosing,
    onElapsed: () => onDismiss(id, 'down'),
  });

  useEffect(() => {
    onHoldChange(id, swipe.isHolding);
  }, [id, onHoldChange, swipe.isHolding]);

  useEffect(() => () => onHoldChange(id, false), [id, onHoldChange]);

  const handleAction = () => {
    onAction?.();
    onDismiss(id, 'down');
  };

  return (
    <div
      className={styles.slot}
      style={{ '--depth': depth } as CSSProperties}
      data-depth={depth}
      data-exit={isClosing ? exit : undefined}
      aria-hidden={depth > 0}
    >
      <div
        className={styles.toast}
        data-edge-swipe-ignore=""
        data-paused={paused}
        style={{ ...swipe.style, '--toast-duration': `${duration}ms` } as CSSProperties}
        {...swipe.handlers}
      >
        <span className={styles.message}>{message}</span>
        {actionLabel && (
          <>
            <span className={styles.countdown} aria-hidden="true">
              <svg className={styles.ring} viewBox="0 0 28 28">
                <circle className={styles.track} cx="14" cy="14" r="11" />
                <circle className={styles.progress} cx="14" cy="14" r="11" />
              </svg>
              <span className={styles.seconds}>{secondsLeft}</span>
            </span>
            <button
              type="button"
              className={styles.action}
              tabIndex={depth > 0 ? -1 : undefined}
              onClick={handleAction}
            >
              {actionLabel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}