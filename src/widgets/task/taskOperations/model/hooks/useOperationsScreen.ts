import { useCallback, useSyncExternalStore } from 'react';
import type { TaskTimeRange } from '@/entities/task';
import {
  getOperationsScreen,
  setOperationsScreen,
  subscribeOperationsScreen,
} from '../lib/operationsScreenStore';

export function useOperationsScreen() {
  const screen = useSyncExternalStore(subscribeOperationsScreen, getOperationsScreen);

  const open = useCallback((range: TaskTimeRange | null, periodLabel: string) => {
    setOperationsScreen({ isOpen: true, range, periodLabel });
  }, []);

  const close = useCallback(() => {
    setOperationsScreen({ ...getOperationsScreen(), isOpen: false });
  }, []);

  return { screen, open, close };
}