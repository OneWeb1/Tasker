import type { TaskTimeRange } from '@/entities/task';
import { createExternalStore } from '@/shared/lib/utils/externalStore';

export interface OperationsScreenState {
  isOpen: boolean;
  range: TaskTimeRange | null;
  periodLabel: string;
}

const store = createExternalStore<OperationsScreenState>({
  isOpen: false,
  range: null,
  periodLabel: '',
});

export const getOperationsScreen = store.get;

export const setOperationsScreen = store.set;

export const subscribeOperationsScreen = store.subscribe;