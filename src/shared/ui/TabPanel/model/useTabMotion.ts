import { useCallback, useState } from 'react';

export type TabMotion = 'forward' | 'backward';

export function useTabMotion<T extends string>(value: T, order: readonly T[]) {
  const [previous, setPrevious] = useState(value);
  const [motion, setMotion] = useState<TabMotion | null>(null);
  const [skipNext, setSkipNext] = useState(false);

  if (value !== previous) {
    setPrevious(value);
    setMotion(
      skipNext ? null : order.indexOf(value) > order.indexOf(previous) ? 'forward' : 'backward',
    );
    setSkipNext(false);
  }

  const clearMotion = useCallback(() => setMotion(null), []);
  const skipNextMotion = useCallback(() => setSkipNext(true), []);

  return { motion, clearMotion, skipNextMotion };
}