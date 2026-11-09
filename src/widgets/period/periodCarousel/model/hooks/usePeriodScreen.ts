import { useCallback, useSyncExternalStore } from 'react';
import {
  getPeriodScreen,
  setPeriodScreen,
  subscribePeriodScreen,
} from '../lib/periodScreenStore';
import type { PeriodCarouselItem } from '../types/periodItem';

export function usePeriodScreen() {
  const screen = useSyncExternalStore(subscribePeriodScreen, getPeriodScreen);

  const open = useCallback((item: PeriodCarouselItem) => {
    setPeriodScreen({ isOpen: true, item });
  }, []);

  const close = useCallback(() => {
    setPeriodScreen({ ...getPeriodScreen(), isOpen: false });
  }, []);

  return { screen, open, close };
}