import { createExternalStore } from '@/shared/lib/utils/externalStore';
import type { PeriodCarouselItem } from '../../types/periodItem';

export interface PeriodScreenState {
  isOpen: boolean;
  item: PeriodCarouselItem | null;
}

const store = createExternalStore<PeriodScreenState>({ isOpen: false, item: null });

export const getPeriodScreen = store.get;

export const setPeriodScreen = store.set;

export const subscribePeriodScreen = store.subscribe;