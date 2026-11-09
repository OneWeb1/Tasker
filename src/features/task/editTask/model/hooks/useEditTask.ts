import { useCallback } from 'react';
import { useUpdateTaskMutation } from '@/entities/task';
import type { NewTask, TaskPriority } from '@/entities/task';

export interface TaskDates {
  date: string;
  endDate?: string | null;
  startTime: string | null;
  endTime: string | null;
}

export function useEditTask(taskId: string) {
  const [updateTask] = useUpdateTaskMutation();

  const patchTask = useCallback(
    (patch: Partial<NewTask>) => {
      void updateTask({ id: taskId, patch });
    },
    [taskId, updateTask],
  );

  const saveTitle = useCallback(
    (title: string) => {
      const trimmed = title.trim();
      if (trimmed) patchTask({ title: trimmed });
    },
    [patchTask],
  );

  const saveDescription = useCallback(
    (description: string) => patchTask({ description: description.trim() }),
    [patchTask],
  );

  const savePriority = useCallback(
    (priority: TaskPriority | undefined) => patchTask({ priority }),
    [patchTask],
  );

  const saveDates = useCallback((dates: TaskDates) => patchTask(dates), [patchTask]);

  const saveWorkspace = useCallback(
    (workspaceId: string, projectId: string | null) => patchTask({ workspaceId, projectId }),
    [patchTask],
  );

  return { saveTitle, saveDescription, savePriority, saveDates, saveWorkspace };
}