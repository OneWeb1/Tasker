import { useCallback } from 'react';
import { buildTaskCopy, useCreateTaskMutation, useDeleteTaskMutation } from '@/entities/task';
import type { Task } from '@/entities/task';

export function useDuplicateTask() {
  const [createTask] = useCreateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const duplicateTask = useCallback(
    (task: Task): Promise<Task | null> =>
      createTask(buildTaskCopy(task))
        .unwrap()
        .catch(() => null),
    [createTask],
  );

  const undoDuplicate = useCallback(
    (id: string) => {
      void deleteTask(id);
    },
    [deleteTask],
  );

  return { duplicateTask, undoDuplicate };
}