import { addDaysToKey, timeToMinutes } from '@/shared/lib/utils/date';
import type { Task, TaskStatusChange } from '../../model/types/task';
import { getTaskSchedule, isTaskDoneOn } from '../taskOccurrence';

export type TaskDetailsStatus = TaskStatusChange['status'];

export interface TaskDetails {
  status: TaskDetailsStatus;
  durationMinutes: number | null;
  doneCount: number;
  skippedCount: number;
  streak: number | null;
}

const countStreak = (completed: ReadonlySet<string>, dateKey: string): number => {
  let key = completed.has(dateKey) ? dateKey : addDaysToKey(dateKey, -1);
  let streak = 0;

  while (completed.has(key)) {
    streak += 1;
    key = addDaysToKey(key, -1);
  }

  return streak;
};

const getDuration = (task: Task): number | null => {
  if (!task.startTime || !task.endTime) return null;
  const duration = timeToMinutes(task.endTime) - timeToMinutes(task.startTime);
  return duration > 0 ? duration : null;
};

const getStatus = (task: Task, dateKey: string): TaskDetailsStatus => {
  if (task.status === 'postponed') return 'postponed';
  return isTaskDoneOn(task, dateKey) ? 'done' : 'active';
};

export const buildTaskDetails = (task: Task, dateKey: string): TaskDetails => {
  const completed = new Set(task.completedDates ?? []);

  return {
    status: getStatus(task, dateKey),
    durationMinutes: getDuration(task),
    doneCount: completed.size,
    skippedCount: task.skippedDates?.length ?? 0,
    streak: getTaskSchedule(task) === 'daily' ? countStreak(completed, dateKey) : null,
  };
};