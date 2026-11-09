import { useSyncExternalStore } from 'react';
import { getCategoryScreen, subscribeCategoryScreen } from '../lib/categoryScreenStore';
import { getPeriodScreen, subscribePeriodScreen } from '../lib/periodScreenStore';

const subscribe = (onChange: () => void) => {
  const unsubscribePeriod = subscribePeriodScreen(onChange);
  const unsubscribeCategory = subscribeCategoryScreen(onChange);
  return () => {
    unsubscribePeriod();
    unsubscribeCategory();
  };
};

const getSnapshot = (): boolean => getPeriodScreen().isOpen || getCategoryScreen().isOpen;

export function useHasOverlayScreen(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot);
}