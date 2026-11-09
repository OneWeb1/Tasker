import type { DayTabCounts } from '../hooks/useDayTabCounts';
import type { TaskFilter } from '../slice/dayTabSlice';

interface TaskFilterMeta {
  label: string;
  countKey: keyof DayTabCounts;
}

export const TASK_FILTER_ORDER: readonly TaskFilter[] = ['all', 'active', 'postponed', 'done'];

export const TASK_FILTER_META: Record<TaskFilter, TaskFilterMeta> = {
  all: { label: 'Всі', countKey: 'all' },
  active: { label: 'Активні', countKey: 'tasks' },
  postponed: { label: 'Відкладені', countKey: 'postponed' },
  done: { label: 'Виконані', countKey: 'done' },
};