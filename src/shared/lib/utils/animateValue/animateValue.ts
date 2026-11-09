import { clamp } from '../motion';

interface AnimateValueOptions {
  from: number;
  to: number;
  duration: number;
  ease: (t: number) => number;
  onUpdate: (value: number) => void;
  onDone: () => void;
}

export const animateValue = ({
  from,
  to,
  duration,
  ease,
  onUpdate,
  onDone,
}: AnimateValueOptions): (() => void) => {
  let frame = 0;
  const startedAt = performance.now();

  const step = (now: number) => {
    const progress = duration > 0 ? clamp((now - startedAt) / duration, 0, 1) : 1;
    onUpdate(from + (to - from) * ease(progress));
    if (progress < 1) {
      frame = requestAnimationFrame(step);
      return;
    }
    onDone();
  };

  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
};