import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { CREATE_ITEM_MODE_ITEMS } from '@/features/createItem';
import type { CreateItemMode } from '@/features/createItem';
import { useHorizontalSwipe } from '@/shared/lib/hooks/useHorizontalSwipe';
import type { TabShiftStore } from '@/shared/lib/hooks/useTabShift';

export type ModeMotion = 'forward' | 'backward';

const MODE_ORDER: readonly CreateItemMode[] = CREATE_ITEM_MODE_ITEMS.map((item) => item.value);

interface UseModeSwipeParams {
  mode: CreateItemMode;
  onChange: (mode: CreateItemMode) => void;
  shiftStore: TabShiftStore<CreateItemMode>;
}

export function useModeSwipe({ mode, onChange, shiftStore }: UseModeSwipeParams) {
  const index = MODE_ORDER.indexOf(mode);
  const previousMode = MODE_ORDER[index - 1];
  const nextMode = MODE_ORDER[index + 1];

  const swipe = useHorizontalSwipe({
    onSwipeLeft: () => {
      if (nextMode) onChange(nextMode);
    },
    onSwipeRight: () => {
      if (previousMode) onChange(previousMode);
    },
    canSwipeLeft: nextMode !== undefined,
    canSwipeRight: previousMode !== undefined,
  });

  const neighbor =
    swipe.offset === 0 ? null : ((swipe.offset < 0 ? nextMode : previousMode) ?? null);

  const { progress, isSettling } = swipe;
  useLayoutEffect(() => {
    shiftStore.set(neighbor ? { to: neighbor, amount: progress, isSettling } : undefined);
  }, [neighbor, progress, isSettling, shiftStore]);

  useEffect(() => () => shiftStore.set(undefined), [shiftStore]);

  const [previous, setPrevious] = useState(mode);
  const [motion, setMotion] = useState<ModeMotion | null>(null);

  if (mode !== previous) {
    setPrevious(mode);
    setMotion(MODE_ORDER.indexOf(mode) > MODE_ORDER.indexOf(previous) ? 'forward' : 'backward');
  }

  const clearMotion = useCallback(() => setMotion(null), []);

  return { ...swipe, motion, clearMotion };
}