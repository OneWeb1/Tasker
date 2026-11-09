let cancelActive: (() => void) | null = null;

export const recoverFirstTap = (): void => {
  cancelActive?.();
  const WINDOW_MS = 4000;
  const TAP_MAX_MS = 300;
  const TAP_SLOP = 24;
  const CLICK_WAIT_MS = 60;

  const until = performance.now() + WINDOW_MS;
  let start: { x: number; y: number; time: number } | null = null;
  let timer = 0;

  const cleanup = () => {
    if (cancelActive === cleanup) cancelActive = null;
    window.clearTimeout(timer);
    window.removeEventListener('touchstart', onStart, { capture: true });
    window.removeEventListener('touchend', onEnd, { capture: true });
  };

  function onStart(event: TouchEvent) {
    const touch = event.touches[0];
    start =
      touch && event.touches.length === 1
        ? { x: touch.clientX, y: touch.clientY, time: event.timeStamp }
        : null;
  }

  function onEnd(event: TouchEvent) {
    const touch = event.changedTouches[0];
    const origin = start;
    start = null;
    if (!origin || !touch) return;

    if (performance.now() > until) {
      cleanup();
      return;
    }

    const isTap =
      event.timeStamp - origin.time <= TAP_MAX_MS &&
      Math.hypot(touch.clientX - origin.x, touch.clientY - origin.y) <= TAP_SLOP;
    if (!isTap) return;

    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!(target instanceof HTMLElement)) return;

    let isClicked = false;
    const onClick = () => {
      isClicked = true;
    };
    window.addEventListener('click', onClick, { capture: true, once: true });
    window.setTimeout(() => {
      window.removeEventListener('click', onClick, { capture: true });
      if (!isClicked) target.click();
    }, CLICK_WAIT_MS);

  }

  window.addEventListener('touchstart', onStart, { passive: true, capture: true });
  window.addEventListener('touchend', onEnd, { passive: true, capture: true });
  timer = window.setTimeout(cleanup, WINDOW_MS);
  cancelActive = cleanup;
};