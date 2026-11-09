let lockCount = 0;

export const isGesturesLocked = (): boolean => lockCount > 0;

export const lockGestures = (): (() => void) => {
  lockCount += 1;
  let isReleased = false;

  return () => {
    if (isReleased) return;
    isReleased = true;
    lockCount = Math.max(0, lockCount - 1);
  };
};