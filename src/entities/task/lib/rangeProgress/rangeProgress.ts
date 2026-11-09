import type { Task } from '../../model/types/task';
import { forEachOccurrence } from '../forEachOccurrence';
import { isTaskDoneOn } from '../taskOccurrence';
import type { TaskProgress } from '../taskProgress';

export const calculateRangeProgress = (
  tasks: readonly Task[],
  from: string,
  to: string,
): TaskProgress => {
  let done = 0;
  let total = 0;

  forEachOccurrence(tasks, from, to, (task, dateKey) => {
    if (task.status === 'postponed') return;
    total += 1;
    if (isTaskDoneOn(task, dateKey)) done += 1;
  });

  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
};