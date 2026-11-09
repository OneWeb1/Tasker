export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const easeOutQuad = (t: number): number => 1 - (1 - t) * (1 - t);

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;