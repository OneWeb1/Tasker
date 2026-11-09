import { useContext } from 'react';
import type { DiffKind } from '@/shared/ui/DiffSign';
import { TaskDiffContext } from '../context/taskDiffContext';
import type { TaskDiffValue } from '../types/taskDiff';

export function useTaskDiff(): TaskDiffValue | null {
  return useContext(TaskDiffContext);
}

export function useDiffKind(id: string): DiffKind {
  return useTaskDiff()?.marks.get(id) ?? 'same';
}