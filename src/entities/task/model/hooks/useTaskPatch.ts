import { useCallback, useContext } from 'react';
import { useUpdateTaskMutation } from '../../api/taskApi';
import { TaskPatchContext } from '../context/taskPatchContext';
import type { TaskContentPatch } from '../types/task';

export function useTaskPatch() {
  const override = useContext(TaskPatchContext);
  const [updateTask] = useUpdateTaskMutation();

  return useCallback(
    (id: string, patch: TaskContentPatch) => {
      if (override) override(patch);
      else void updateTask({ id, patch });
    },
    [override, updateTask],
  );
}