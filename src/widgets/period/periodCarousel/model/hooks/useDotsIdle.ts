import { useCallback, useEffect, useRef, useState } from 'react';
import type { DotsProgressStore } from '../lib/dotsProgress';

export function useDotsIdle(store: DotsProgressStore, delay: number) {
  const [isIdle, setIsIdle] = useState(true);
  const timerRef = useRef(0);

  const wake = useCallback(() => {
    setIsIdle(false);
    window.clearTimeout(timerRef.current);
    const arm = () => {
      timerRef.current = window.setTimeout(() => {
        if (store.get().isDragging) {
          arm();
          return;
        }
        setIsIdle(true);
      }, delay);
    };
    arm();
  }, [store, delay]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return { isIdle, wake };
}