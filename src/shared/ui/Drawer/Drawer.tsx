import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '@/shared/lib/hooks/useBodyScrollLock';
import { useExitTransition } from '@/shared/lib/hooks/useExitTransition';
import { useSwipeLeftToClose } from '@/shared/lib/hooks/useSwipeLeftToClose';
import { CloseIcon } from '@/shared/ui/icons';
import styles from './Drawer.module.css';

interface DrawerProps {
  isOpen: boolean;
  title: string;
  side?: 'left' | 'right';
  footer?: ReactNode;
  isCovered?: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Drawer({
  isOpen,
  title,
  side = 'right',
  footer,
  isCovered = false,
  onClose,
  children,
}: DrawerProps) {
  const { isMounted, isClosing, handleExited } = useExitTransition(isOpen);
  useBodyScrollLock(isOpen && !isCovered);
  const swipe = useSwipeLeftToClose({
    onClose,
    isEnabled: isOpen && !isCovered && side === 'left',
  });

  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement;
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isCovered) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isCovered, onClose]);

  if (!isMounted) return null;

  return createPortal(
    <div
      className={styles.overlay}
      data-closing={isClosing}
      data-side={side}
      onClick={isOpen ? onClose : undefined}
    >
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={styles.panel}
        data-closing={isClosing}
        data-covered={isCovered || undefined}
        data-side={side}
        style={swipe.style}
        {...swipe.handlers}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && event.propertyName === 'transform') {
            handleExited();
          }
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={styles.close} aria-label="Закрити" onClick={onClose}>
            <CloseIcon width={26} height={26} />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </section>
    </div>,
    document.body,
  );
}