import { useEffect, useRef, useState } from 'react';

const TICK_MS = 100;

interface UseToastTimerOptions {
  duration: number;
  isPaused: boolean;
  onElapsed: () => void;
}

export function useToastTimer({ duration, isPaused, onElapsed }: UseToastTimerOptions) {
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(duration / 1000));
  const remaining = useRef(duration);
  const onElapsedRef = useRef(onElapsed);

  useEffect(() => {
    onElapsedRef.current = onElapsed;
  });

  useEffect(() => {
    if (isPaused || remaining.current <= 0) return;

    const startedAt = performance.now();
    const startRemaining = remaining.current;

    const interval = window.setInterval(() => {
      const left = Math.max(0, startRemaining - (performance.now() - startedAt));
      remaining.current = left;
      setSecondsLeft(Math.ceil(left / 1000));

      if (left === 0) {
        window.clearInterval(interval);
        onElapsedRef.current();
      }
    }, TICK_MS);

    return () => {
      window.clearInterval(interval);
      remaining.current = Math.max(0, startRemaining - (performance.now() - startedAt));
    };

  }, [isPaused]);

  return { secondsLeft };
}