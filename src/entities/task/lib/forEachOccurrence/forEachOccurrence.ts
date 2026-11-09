import { getDateRange } from '@/shared/lib/utils/date';
import type { Task } from '../../model/types/task';
import { isRecurringTask, isTaskSkippedOn, occursOnDate } from '../taskOccurrence';

const lowerBound = (keys: readonly string[], target: string): number => {
  let low = 0;
  let high = keys.length;

  while (low < high) {
    const middle = (low + high) >>> 1;
    if ((keys[middle] ?? '') < target) low = middle + 1;
    else high = middle;
  }
  return low;
};

const getLastDay = (task: Task, to: string): string => {
  if (isRecurringTask(task)) return to;
  return task.endDate && task.endDate > task.date ? task.endDate : task.date;
};

export const forEachOccurrence = (
  tasks: readonly Task[],
  from: string,
  to: string,
  visit: (task: Task, dateKey: string) => void,
): void => {
  if (from > to) return;
  const days = getDateRange(from, to);

  for (const task of tasks) {
    if (task.date > to) continue;
    const lastDay = getLastDay(task, to);
    if (lastDay < from) continue;

    for (let position = lowerBound(days, task.date); position < days.length; position += 1) {
      const dateKey = days[position];
      if (dateKey === undefined || dateKey > lastDay) break;
      if (occursOnDate(task, dateKey) && !isTaskSkippedOn(task, dateKey)) visit(task, dateKey);
    }

  }
};