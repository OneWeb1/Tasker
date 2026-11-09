const FALLBACK_DELAY_MS = 100;

export const afterPaint = (): Promise<void> =>
  new Promise((resolve) => {
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    requestAnimationFrame(() => window.setTimeout(settle, 0));
    window.setTimeout(settle, FALLBACK_DELAY_MS);
  });