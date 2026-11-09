import { useEffect } from 'react';

let lockCount = 0;
let restoreStyles: (() => void) | null = null;

const applyLock = (): (() => void) => {
  const root = document.documentElement;
  const previous = {
    rootOverflow: root.style.overflow,
    rootOverscroll: root.style.overscrollBehavior,
  };
  root.style.overflow = 'hidden';
  root.style.overscrollBehavior = 'none';

  return () => {
    root.style.overflow = previous.rootOverflow;
    root.style.overscrollBehavior = previous.rootOverscroll;
  };
};

const acquireLock = (): (() => void) => {
  if (lockCount === 0) restoreStyles = applyLock();
  lockCount += 1;

  return () => {
    lockCount -= 1;
    if (lockCount > 0) return;
    restoreStyles?.();
    restoreStyles = null;
  };
};

export function useBodyScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;
    return acquireLock();
  }, [isLocked]);
}