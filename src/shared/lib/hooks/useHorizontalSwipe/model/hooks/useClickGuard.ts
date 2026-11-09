import { useCallback, useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';

export function useClickGuard() {
  const isArmed = useRef(false);
  const timer = useRef(0);

  const arm = useCallback(() => {
    window.clearTimeout(timer.current);
    isArmed.current = true;
  }, []);

  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    isArmed.current = false;
  }, []);

  const releaseSoon = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      isArmed.current = false;
    }, 0);
  }, []);

  const onClickCapture = useCallback((event: MouseEvent<HTMLElement>) => {
    if (!isArmed.current) return;
    isArmed.current = false;
    event.stopPropagation();
    event.preventDefault();
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { arm, reset, releaseSoon, onClickCapture };
}