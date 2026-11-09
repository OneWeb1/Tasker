import type { ReactNode } from 'react';
import { TaskDiffContext } from '../../model/context/taskDiffContext';
import { TaskPatchContext } from '../../model/context/taskPatchContext';
import type { TaskDiffValue } from '../../model/types/taskDiff';

const discardPatch = () => undefined;

interface TaskDiffProviderProps {
  value: TaskDiffValue;
  children: ReactNode;
}

export function TaskDiffProvider({ value, children }: TaskDiffProviderProps) {
  return (
    <TaskDiffContext.Provider value={value}>
      <TaskPatchContext.Provider value={discardPatch}>{children}</TaskPatchContext.Provider>
    </TaskDiffContext.Provider>
  );
}