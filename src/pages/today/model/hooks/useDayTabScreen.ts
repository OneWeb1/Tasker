import { useCallback, useSyncExternalStore } from 'react';
import type { DayTab } from '@/features/day/switchTab';
import type { DateRange } from '@/shared/lib/utils/date';
import {
  getDayTabScreen,
  setDayTabScreen,
  subscribeDayTabScreen,
} from '../lib/dayTabScreenStore';

export function useDayTabScreen() {
  const screen = useSyncExternalStore(subscribeDayTabScreen, getDayTabScreen);

  const open = useCallback((tab: DayTab, range: DateRange | null) => {
    setDayTabScreen({ isOpen: true, tab, range });
  }, []);

  const close = useCallback(() => {
    setDayTabScreen({ ...getDayTabScreen(), isOpen: false });
  }, []);

  return { screen, open, close };
}