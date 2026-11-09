import type { DayTab } from '@/features/day/switchTab';
import type { DateRange } from '@/shared/lib/utils/date';
import { createExternalStore } from '@/shared/lib/utils/externalStore';

export interface DayTabScreenState {
  isOpen: boolean;
  tab: DayTab;
  range: DateRange | null;
}

const store = createExternalStore<DayTabScreenState>({
  isOpen: false,
  tab: 'tasks',
  range: null,
});

export const getDayTabScreen = store.get;

export const setDayTabScreen = store.set;

export const subscribeDayTabScreen = store.subscribe;