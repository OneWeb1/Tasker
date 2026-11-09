import { useEffect, useLayoutEffect, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  durationMs?: number;
}

const DEFAULT_DURATION_MS = 300;

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function AnimatedNumber({
  value,
  format,
  durationMs = DEFAULT_DURATION_MS,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const displayRef = useRef(value);

  const write = (next: number) => {
    displayRef.current = next;
    if (!ref.current) return;
    const rounded = Math.round(next);
    ref.current.textContent = format ? format(rounded) : String(rounded);
  };

  useLayoutEffect(() => {
    write(displayRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const from = displayRef.current;
    if (from === value) return;

    if (prefersReducedMotion()) {
      write(value);
      return;
    }

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      write(progress === 1 ? value : from + (value - from) * easeInOutCubic(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  return <span ref={ref} />;
}