import { useMemo } from 'react';
import type { Task } from '@/entities/task';
import { useToast } from '@/shared/ui/Toast';
import type { SubtaskBulkActions } from '../types/subtask';
import type { useSubtasks } from './useSubtasks';

type SubtasksApi = Pick<
  ReturnType<typeof useSubtasks>,
  'setSubtasksDone' | 'duplicateSubtasks' | 'removeSubtasks' | 'restoreSubtasks'
>;

export function useSubtaskBulkActions(
  snapshot: Task['subtasks'],
  { setSubtasksDone, duplicateSubtasks, removeSubtasks, restoreSubtasks }: SubtasksApi,
): SubtaskBulkActions {
  const { showToast } = useToast();

  return useMemo(() => {
    const announce = (message: string) =>
      showToast({
        message,
        actionLabel: 'Відмінити',
        onAction: () => restoreSubtasks(snapshot),
      });

    return {
      onToggleDone: (ids, done) => {
        setSubtasksDone(ids, done);
        announce(done ? 'Позначено виконаними' : 'Повернуто у відкриті');
      },
      onDuplicate: (ids) => {
        if (!duplicateSubtasks(ids)) {
          showToast({ message: 'Не вдалося створити копії' });
          return;
        }
        announce(ids.length === 1 ? 'Підзавдання продубльовано' : 'Підзавдання продубльовано');
      },
      onDelete: (ids) => {
        removeSubtasks(ids);
        announce(ids.length === 1 ? 'Підзавдання видалено' : `Видалено підзавдань: ${ids.length}`);
      },
    };

  }, [duplicateSubtasks, removeSubtasks, restoreSubtasks, setSubtasksDone, showToast, snapshot]);
}