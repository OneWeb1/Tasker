import { useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';

interface UsePanelHeightLockOptions {
  panelRef: RefObject<HTMLElement | null>;
  isMounted: boolean;
  isClosing: boolean;
}

const ENTER_FALLBACK_MS = 600;

const lock = (element: HTMLElement, height: number) => {
  element.style.bottom = 'auto';
  element.style.height = `${height}px`;
};

const unlock = (element: HTMLElement) => {
  element.style.bottom = '';
  element.style.height = '';
};

export function usePanelHeightLock({ panelRef, isMounted, isClosing }: UsePanelHeightLockOptions) {
  const stableHeight = useRef(0);

  useLayoutEffect(() => {
    const element = panelRef.current;
    if (!isMounted || !element) return;

    if (isClosing) {
      lock(element, Math.max(stableHeight.current, element.offsetHeight));
      return;
    }

    if (element.style.height === '') stableHeight.current = element.offsetHeight;
    lock(element, stableHeight.current);

    const release = () => unlock(element);
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target === element) release();
    };
    const timer = window.setTimeout(release, ENTER_FALLBACK_MS);
    element.addEventListener('animationend', onAnimationEnd);

    return () => {
      window.clearTimeout(timer);
      element.removeEventListener('animationend', onAnimationEnd);
    };

  }, [isClosing, isMounted, panelRef]);
}