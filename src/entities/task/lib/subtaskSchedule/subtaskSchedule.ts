import type { Task, TaskSubtask } from '../../model/types/task';
import { subtaskToTask } from '../subtaskTask';
import { isTaskSkippedOn, occursOnDate } from '../taskOccurrence';

export interface ScheduledSubtask {
  id: string;
  taskId: string;
  ancestorIds: readonly string[];
  title: string;
  categoryId: string;
  projectId: string | null;
  startTime: string;
  endTime: string;
  isDone: boolean;
}

export const collectScheduledSubtasks = (task: Task, dateKey: string): ScheduledSubtask[] => {
  if (task.status === 'postponed') return [];

  const walk = (
    items: readonly TaskSubtask[],
    parent: Task,
    anchor: Task,
    ancestorIds: readonly string[],
  ): ScheduledSubtask[] =>
    items.flatMap((item) => {
      const current = subtaskToTask(item, parent);
      const hasOwnDate = item.date !== undefined;
      const nextAnchor = hasOwnDate ? current : anchor;
      const isVisible = hasOwnDate
        ? occursOnDate(current, dateKey)
        : occursOnDate(anchor, dateKey) && !isTaskSkippedOn(anchor, dateKey);

      const self =
        isVisible && item.startTime && item.endTime
          ? [
              {
                id: item.id,
                taskId: task.id,
                ancestorIds,
                title: item.title,
                categoryId: task.categoryId,
                projectId: task.projectId,
                startTime: item.startTime,
                endTime: item.endTime,
                isDone: item.done,
              },
            ]
          : [];

      const nested = item.subtasks
        ? walk(item.subtasks, current, nextAnchor, [...ancestorIds, item.id])
        : [];

      return [...self, ...nested];
    });

  return walk(task.subtasks ?? [], task, task, [task.id]);
};