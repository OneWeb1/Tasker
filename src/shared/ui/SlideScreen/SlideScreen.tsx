import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, SyntheticEvent } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '@/shared/lib/hooks/useBodyScrollLock';
import { useEdgeSwipe } from '@/shared/lib/hooks/useEdgeSwipe';
import { useExitTransition } from '@/shared/lib/hooks/useExitTransition';
import { usePanelHeightLock } from '@/shared/lib/hooks/usePanelHeightLock';
import { useScreenPortal } from '@/shared/lib/hooks/useScreenPortal';
import { useSwipeDownToClose } from '@/shared/lib/hooks/useSwipeDownToClose';
import { ChevronLeftIcon, CloseIcon } from '@/shared/ui/icons';
import styles from './SlideScreen.module.css';

const stopPropagation = (event: SyntheticEvent) => event.stopPropagation();

interface SlideScreenProps {
  isOpen: boolean;
  title: string;
  action?: ReactNode;
  direction?: 'horizontal' | 'vertical';
  swipeToDismiss?: boolean;
  isHeaderPlain?: boolean;
  isTitleLarge?: boolean;
  isTitleHidden?: boolean;
  isHeaderHidden?: boolean;
  isScrollLocked?: boolean;
  marksRouteCommit?: boolean;
  surfaceStyle?: CSSProperties;
  onClose: () => void;
  children: ReactNode;
}

export function SlideScreen({
  isOpen,
  title,
  action,
  direction = 'horizontal',
  swipeToDismiss = true,
  isHeaderPlain = false,
  isTitleLarge = false,
  isTitleHidden = false,
  isHeaderHidden = false,
  isScrollLocked = true,
  marksRouteCommit = false,
  surfaceStyle,
  onClose,
  children,
}: SlideScreenProps) {
  const { isMounted, isClosing, handleExited } = useExitTransition(isOpen);
  const portalTarget = useScreenPortal();
  const [isSwiped, setIsSwiped] = useState(false);
  const isHidden = isClosing && isSwiped;
  useBodyScrollLock(isMounted && !isHidden && isScrollLocked);

  if (isOpen && isSwiped) {
    setIsSwiped(false);
  }

  const panelRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const isVertical = direction === 'vertical';

  const handleSwipe = () => {
    setIsSwiped(true);
    onClose();
  };

  useEdgeSwipe({
    onSwipe: handleSwipe,
    targetRef: panelRef,
    isActive: isOpen,
    isEnabled: isOpen && swipeToDismiss && !isVertical,
    showBackdrop: true,
    marksRouteCommit,
  });

  useSwipeDownToClose({
    targetRef: panelRef,
    scrollRef: bodyRef,
    isEnabled: isOpen && swipeToDismiss && isVertical,
    onDismiss: onClose,
  });

  usePanelHeightLock({ panelRef, isMounted, isClosing });

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement;
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isClosing) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && panelRef.current?.contains(active)) active.blur();
  }, [isClosing]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isMounted || isHidden) return null;

  const screen = (
    <section
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      className={styles.panel}
      data-closing={isClosing}
      data-direction={direction}
      data-shift-below={!isVertical || undefined}
      onPointerDown={stopPropagation}
      onPointerMove={stopPropagation}
      onPointerUp={stopPropagation}
      onPointerCancel={stopPropagation}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && event.propertyName === 'transform') {
          handleExited();
        }
      }}
    >
      <div className={styles.surface} style={surfaceStyle}>
        {!isHeaderHidden && (
        <header
          className={styles.header}
          data-plain={isHeaderPlain || undefined}
          data-large={isTitleLarge || undefined}
        >
          <div className={styles.heading}>
            {isTitleLarge ? (
              <button type="button" className={styles.back} aria-label="Закрити" onClick={onClose}>
                <CloseIcon width={26} height={26} />
              </button>
            ) : (
              <>
                <button type="button" className={styles.back} aria-label="Назад" onClick={onClose}>
                  <ChevronLeftIcon width={28} height={28} />
                </button>
                <h2 className={styles.title}>{title}</h2>
              </>
            )}
          </div>
          {action && <div className={styles.action}>{action}</div>}
        </header>
        )}
        <div ref={bodyRef} className={styles.body}>
          {isTitleLarge && !isTitleHidden && <h2 className={styles.largeTitle}>{title}</h2>}
          {children}
        </div>
      </div>
    </section>
  );

  return portalTarget ? createPortal(screen, portalTarget) : screen;
}