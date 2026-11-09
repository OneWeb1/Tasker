import type { Task } from '../../model/types/task';
import { isTaskDoneOn } from '../taskOccurrence';

export interface TaskProgress {
  done: number;
  total: number;
  percent: number;
}

export const calculateTaskProgress = (tasks: readonly Task[], dateKey: string): TaskProgress => {
  const total = tasks.length;
  const done = tasks.filter((task) => isTaskDoneOn(task, dateKey)).length;

  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  };
};