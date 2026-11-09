export interface Scheduler {
  requestFrame: (callback: () => void) => number;
  cancelFrame: (handle: number) => void;
  setTimer: (callback: () => void, delayMs: number) => number;
  clearTimer: (handle: number) => void;
}

export const browserScheduler: Scheduler = {
  requestFrame: (callback) => window.requestAnimationFrame(() => callback()),
  cancelFrame: (handle) => window.cancelAnimationFrame(handle),
  setTimer: (callback, delayMs) => window.setTimeout(callback, delayMs),
  clearTimer: (handle) => window.clearTimeout(handle),
};