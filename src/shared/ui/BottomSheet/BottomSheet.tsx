import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '@/shared/lib/hooks/useBodyScrollLock';
import { useDragToClose } from '@/shared/lib/hooks/useDragToClose';
import { useExitTransition } from '@/shared/lib/hooks/useExitTransition';
import { ArrowLeftIcon, CloseIcon } from '@/shared/ui/icons';
import styles from './BottomSheet.module.css';

const MAX_FULL_HEIGHT = 640;

interface BottomSheetProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onBack?: () => void;
  header?: ReactNode;
  size?: 'auto' | 'full';
   isCovered?: boolean;
   onExited?: () => void;
   children: ReactNode;
  }

const UNFREEZE_DELAY_MS = 500;

export function BottomSheet({
  isOpen,
  title,
  onClose,
  onBack,
  header,
   size = 'auto',
   isCovered = false,
   onExited,
   children,
  }: BottomSheetProps) {
  const { isMounted, isClosing, handleExited } = useExitTransition(isOpen);
  useBodyScrollLock(isMounted);
  const { offset, isDragging, handleProps } = useDragToClose({ onClose });

   const overlayRef = useRef<HTMLDivElement>(null);
   const sheetRef = useRef<HTMLElement>(null);
   const wasMountedRef = useRef(false);

   useEffect(() => {
     if (isMounted) {
       wasMountedRef.current = true;
       return;
     }
     if (!wasMountedRef.current) return;
     wasMountedRef.current = false;
     onExited?.();
   }, [isMounted, onExited]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const sheet = sheetRef.current;
    if (!isMounted || size !== 'full' || !overlay || !sheet) return;

    let frame = 0;
    let previousAvailable: number | null = null;
    const observer = new ResizeObserver(([entry]) => {
      const available = entry?.contentBoxSize?.[0]?.blockSize ?? entry?.contentRect.height;
      if (!available) return;
      const roundedAvailable = Math.round(available);
      const delta = previousAvailable === null ? 0 : roundedAvailable - previousAvailable;
      previousAvailable = roundedAvailable;

      if (sheet.dataset.ready === 'true' && delta !== 0) {
        sheet.dataset.adjusting = 'true';
        sheet.style.marginBottom = `${delta}px`;
        void sheet.offsetHeight;
        delete sheet.dataset.adjusting;
        sheet.style.marginBottom = '0px';
      }

      sheet.style.height = `${Math.min(MAX_FULL_HEIGHT, roundedAvailable)}px`;

      if (sheet.dataset.ready !== 'true') {
        frame = requestAnimationFrame(() => {
          sheet.dataset.ready = 'true';
        });
      }
    });
    observer.observe(overlay);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };

  }, [isMounted, size]);

  const isFrozenRef = useRef(false);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    if (isCovered) {
      overlay.style.height = `${overlay.getBoundingClientRect().height}px`;
      isFrozenRef.current = true;
      return;
    }

    if (!isFrozenRef.current) return;
    const timer = window.setTimeout(() => {
      isFrozenRef.current = false;
      if (overlayRef.current) overlayRef.current.style.height = '';
    }, UNFREEZE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isCovered, isMounted]);

  useEffect(() => {
    if (!isClosing) return;

    const overlay = overlayRef.current;
    if (overlay) {
      overlay.style.height = `${overlay.getBoundingClientRect().height}px`;
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [isClosing]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className={styles.overlay}
      data-closing={isClosing}
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={sheetRef}
        className={styles.sheet}
        data-size={size}
        style={{
          transform: isClosing ? 'translateY(100%)' : `translateY(${offset}px)`,
          transition: isDragging ? 'none' : undefined,
        }}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && event.propertyName === 'transform') {
            handleExited();
          }
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.handle} {...handleProps} />
        {header ?? (
        <div className={styles.header}>
          <div className={styles.side}>
            {onBack && (
              <button type="button" className={styles.control} aria-label="Назад" onClick={onBack}>
                <ArrowLeftIcon width={20} height={20} />
              </button>
            )}
          </div>
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.side}>
            <button type="button" className={styles.control} aria-label="Закрити" onClick={onClose}>
              <CloseIcon width={20} height={20} />
            </button>
          </div>
        </div>
        )}
        <div className={styles.body}>{children}</div>
      </section>
    </div>,
    document.body,
  );
}