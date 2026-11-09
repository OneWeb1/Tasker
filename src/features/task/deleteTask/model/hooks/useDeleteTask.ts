import { useCallback } from 'react';
import { useDeleteTaskMutation, useRestoreDeletedTaskMutation } from '@/entities/task';
import type { DeletedTask } from '@/entities/task';

export function useDeleteTask() {
  const [deleteTaskMutation] = useDeleteTaskMutation();
  const [restoreDeletedTask] = useRestoreDeletedTaskMutation();

  const deleteTask = useCallback(
    (id: string): Promise<DeletedTask | null> =>
      deleteTaskMutation(id)
        .unwrap()
        .catch(() => null),
    [deleteTaskMutation],
  );

  const undoDelete = useCallback(
    (snapshot: DeletedTask) => {
      void restoreDeletedTask(snapshot);
    },
    [restoreDeletedTask],
  );

  const deleteTasks = useCallback(
    async (ids: readonly string[]): Promise<DeletedTask[]> => {
      const snapshots: DeletedTask[] = [];
      for (const id of ids) {
        const snapshot = await deleteTask(id);
        if (snapshot) snapshots.push(snapshot);
      }
      return snapshots;
    },
    [deleteTask],
  );

  const undoDeleteMany = useCallback(
    async (snapshots: readonly DeletedTask[]): Promise<void> => {
      for (const snapshot of [...snapshots].reverse()) {
        await restoreDeletedTask(snapshot);
      }
    },
    [restoreDeletedTask],
  );

  return { deleteTask, undoDelete, deleteTasks, undoDeleteMany };
}