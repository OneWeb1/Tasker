import { getDateRange } from '@/shared/lib/utils/date';
import type { Task } from '../../model/types/task';
import { filterTasksByDate } from '../filterTasksByDate';
import { isTaskDoneOn } from '../taskOccurrence';

export interface DayActivity {
  done: number;
  total: number;
}

export const calculateTaskActivity = (
  tasks: readonly Task[],
  from: string,
  to: string,
): Record<string, DayActivity> => {
  const activity: Record<string, DayActivity> = {};
  const activeTasks = tasks.filter((task) => task.status !== 'postponed');

  for (const dateKey of getDateRange(from, to)) {
    const dayTasks = filterTasksByDate(activeTasks, dateKey);
    if (dayTasks.length === 0) continue;

    activity[dateKey] = {
      done: dayTasks.filter((task) => isTaskDoneOn(task, dateKey)).length,
      total: dayTasks.length,
    };
  }

  return activity;
};