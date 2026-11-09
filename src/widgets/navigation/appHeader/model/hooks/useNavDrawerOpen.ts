import { useSyncExternalStore } from 'react';
import { getNavDrawerOpen, subscribeNavDrawer } from '../lib/navDrawerStore';

export function useNavDrawerOpen(): boolean {
  return useSyncExternalStore(subscribeNavDrawer, getNavDrawerOpen);
}