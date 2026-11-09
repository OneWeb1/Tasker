let isLocked = false;

const onTouchMove = (event: TouchEvent): void => {
  if (event.cancelable) event.preventDefault();
};

export const lockTouchScroll = (): void => {
  if (isLocked) return;
  isLocked = true;

  const release = (): void => {
    isLocked = false;
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', release, true);
    window.removeEventListener('touchcancel', release, true);
  };

  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', release, { capture: true });
  window.addEventListener('touchcancel', release, { capture: true });
};