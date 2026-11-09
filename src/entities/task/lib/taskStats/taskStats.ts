import { timeToMinutes } from '@/shared/lib/utils/date';
import type { Task } from '../../model/types/task';
import { isTaskDoneOn } from '../taskOccurrence';

export interface TaskStats {
  remaining: number;
  plannedMinutes: number;
  doneMinutes: number;
  untimedCount: number;
}

export const calculateTaskStats = (tasks: readonly Task[], dateKey: string): TaskStats => {
  const stats: TaskStats = { remaining: 0, plannedMinutes: 0, doneMinutes: 0, untimedCount: 0 };

  for (const task of tasks) {
    const isDone = isTaskDoneOn(task, dateKey);
    if (!isDone) stats.remaining += 1;

    if (!task.startTime || !task.endTime) {
      stats.untimedCount += 1;
      continue;
    }

    const duration = timeToMinutes(task.endTime) - timeToMinutes(task.startTime);
    if (duration <= 0) continue;

    stats.plannedMinutes += duration;
    if (isDone) stats.doneMinutes += duration;

  }

  return stats;
};