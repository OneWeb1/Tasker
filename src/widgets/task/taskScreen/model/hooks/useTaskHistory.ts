import { useMemo } from 'react';
import { useGetCategoriesQuery } from '@/entities/category';
import { TASK_PRIORITY_LABELS, buildTaskHistory, getTaskScheduleLabel } from '@/entities/task';
import type {
  Task,
  TaskDetailsStatus,
  TaskFieldChange,
  TaskPriority,
  TaskSchedule,
} from '@/entities/task';
import { parseDateKey } from '@/shared/lib/utils/date';
import { TASK_FIELD_CHANGE_TITLES } from '../constants/taskScreen';

export interface TaskHistoryItem {
  id: string;
  at: number;
  kind: 'status' | 'field' | 'created';
  title: string;
  status?: TaskDetailsStatus;
  value?: string;
}

const DATE_FORMAT = new Intl.DateTimeFormat('uk-UA', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function useTaskHistory(task: Task): TaskHistoryItem[] {
  const { data: categories } = useGetCategoriesQuery();

  return useMemo(() => {
    const formatValue = (field: TaskFieldChange['field'], value: string | null) => {
      switch (field) {
        case 'title':
          return value ?? undefined;
        case 'priority':
          return value ? TASK_PRIORITY_LABELS[value as TaskPriority] : 'Без пріоритету';
        case 'date':
          return value ? DATE_FORMAT.format(parseDateKey(value)) : undefined;
        case 'time':
          return value ?? 'Без часу';
        case 'category':
          return categories?.find((category) => category.id === value)?.title;
        case 'schedule':
          return getTaskScheduleLabel({ ...task, schedule: (value ?? 'once') as TaskSchedule });
        default:
          return undefined;
      }
    };

    return buildTaskHistory(task).map((entry): TaskHistoryItem => {
      if (entry.kind === 'status') {
        return {
          id: entry.id,
          at: entry.at,
          kind: 'status',
          title: 'Ви змінили статус на',
          status: entry.status,
        };
      }
      if (entry.kind === 'field') {
        return {
          id: entry.id,
          at: entry.at,
          kind: 'field',
          title: TASK_FIELD_CHANGE_TITLES[entry.field],
          value: formatValue(entry.field, entry.value),
        };
      }
      return { id: entry.id, at: entry.at, kind: 'created', title: 'Ви створили це завдання' };
    });
  }, [categories, task]);
}