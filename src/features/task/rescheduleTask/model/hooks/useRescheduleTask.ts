import { useCallback } from 'react';
import { useUpdateTaskMutation } from '@/entities/task';
import type { Task } from '@/entities/task';
import { addDaysToKey } from '@/shared/lib/utils/date';

export function useRescheduleTask() {
  const [updateTask] = useUpdateTaskMutation();

  const moveToTomorrow = useCallback(
    (tasks: readonly Task[], dateKey: string) => {
      const target = addDaysToKey(dateKey, 1);
      tasks.forEach((task) => {
        void updateTask({ id: task.id, patch: { date: target } });
      });
    },
    [updateTask],
  );

  const undoMove = useCallback(
    (tasks: readonly Task[]) => {
      tasks.forEach((task) => {
        void updateTask({ id: task.id, patch: { date: task.date } });
      });
    },
    [updateTask],
  );

  return { moveToTomorrow, undoMove };
}