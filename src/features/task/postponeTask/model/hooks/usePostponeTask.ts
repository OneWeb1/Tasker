import { useCallback } from 'react';
import { appendStatusChange, useUpdateTaskMutation } from '@/entities/task';
import type { Task } from '@/entities/task';

export function usePostponeTask() {
  const [updateTask] = useUpdateTaskMutation();

  const postponeTask = useCallback(
    (task: Task) => {
      void updateTask({
        id: task.id,
        patch: { status: 'postponed', ...appendStatusChange(task, 'postponed', Date.now()) },
      });
    },
    [updateTask],
  );

  const restoreTask = useCallback(
    (task: Task, date: string) => {
      void updateTask({
        id: task.id,
        patch: { status: 'active', date, ...appendStatusChange(task, 'active', Date.now()) },
      });
    },
    [updateTask],
  );

  const skipOccurrence = useCallback(
    (task: Task, dateKey: string) => {
      void updateTask({
        id: task.id,
        patch: { skippedDates: [...(task.skippedDates ?? []), dateKey] },
      });
    },
    [updateTask],
  );

  const restoreSkipped = useCallback(
    (task: Task) => {
      void updateTask({ id: task.id, patch: { skippedDates: task.skippedDates ?? [] } });
    },
    [updateTask],
  );

  return { postponeTask, restoreTask, skipOccurrence, restoreSkipped };
}