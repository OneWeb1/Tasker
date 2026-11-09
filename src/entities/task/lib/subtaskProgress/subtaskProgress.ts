import type { Task } from '../../model/types/task';

export interface SubtaskProgress {
  done: number;
  total: number;
  percent: number;
}

export const getSubtaskProgress = (task: Task): SubtaskProgress | null => {
  const subtasks = task.subtasks;
  if (!subtasks || subtasks.length === 0) return null;

  const total = subtasks.length;
  const done = subtasks.filter((subtask) => subtask.done).length;

  return { done, total, percent: Math.round((done / total) * 100) };
};