import { useCallback } from 'react';
import {
  addSubtaskChild,
  cloneSubtask,
  findSubtask,
  findSubtaskParentId,
  getSubtaskProgress,
  patchSubtask,
  removeSubtaskItem,
  stampNewSubtask,
  useTaskPatch,
} from '@/entities/task';
import type { Task } from '@/entities/task';
import { createId } from '@/shared/lib/utils/createId';
import type { NewSubtask, SubtaskPatch } from '../types/subtask';

export function useSubtasks(task: Task, parentId?: string) {
  const patchTask = useTaskPatch();
  const rootSubtasks = task.subtasks ?? [];
  const subtasks =
    parentId === undefined
      ? rootSubtasks
      : (findSubtask(rootSubtasks, parentId)?.subtasks ?? []);
  const openSubtasks = subtasks.filter((item) => !item.done);
  const doneSubtasks = subtasks.filter((item) => item.done);

  const save = useCallback(
    (next: Task['subtasks']) => {
      patchTask(task.id, { subtasks: next });
    },
    [task.id, patchTask],
  );

  const addSubtask = useCallback(
    (draft: NewSubtask) => {
      const title = draft.title.trim();
      if (!title) return;
      const subtask = { ...stampNewSubtask({ ...draft, title }, Date.now()), id: createId() };
      save(addSubtaskChild(rootSubtasks, parentId, subtask));
    },
    [parentId, rootSubtasks, save],
  );

  const toggleSubtask = useCallback(
    (id: string) => {
      const current = findSubtask(rootSubtasks, id);
      if (current) save(patchSubtask(task, id, { done: !current.done }, Date.now()));
    },
    [rootSubtasks, save, task],
  );

  const updateSubtask = useCallback(
    (id: string, patch: SubtaskPatch) => {
      save(patchSubtask(task, id, patch, Date.now()));
    },
    [save, task],
  );

  const removeSubtask = useCallback(
    (id: string) => {
      save(removeSubtaskItem(rootSubtasks, id));
    },
    [rootSubtasks, save],
  );

  const restoreSubtasks = useCallback(
    (snapshot: Task['subtasks']) => {
      save(snapshot);
    },
    [save],
  );

  const removeSubtasks = useCallback(
    (ids: readonly string[]) => {
      save(ids.reduce((items, id) => removeSubtaskItem(items, id), rootSubtasks));
    },
    [rootSubtasks, save],
  );

  const setSubtasksDone = useCallback(
    (ids: readonly string[], done: boolean) => {
      const now = Date.now();
      const next = ids.reduce<Task>((current, id) => {
        const item = findSubtask(current.subtasks ?? [], id);
        if (!item || item.done === done) return current;
        return { ...current, subtasks: patchSubtask(current, id, { done }, now) };
      }, task);
      save(next.subtasks);
    },
    [save, task],
  );

  const duplicateSubtasks = useCallback(
    (ids: readonly string[]): boolean => {
      const now = Date.now();
      let next = rootSubtasks;
      let copies = 0;

      ids.forEach((id) => {
        const source = findSubtask(rootSubtasks, id);
        const parent = findSubtaskParentId(rootSubtasks, id);
        if (!source || parent === undefined) return;
        const { id: copyId, ...draft } = cloneSubtask(source);
        const copy = { ...stampNewSubtask(draft, now), id: copyId };
        next = addSubtaskChild(next, parent ?? undefined, copy);
        copies += 1;
      });

      if (copies === 0) return false;
      save(next);
      return true;
    },
    [rootSubtasks, save],

  );

  const duplicateSubtask = useCallback(
    (id: string): boolean => duplicateSubtasks([id]),
    [duplicateSubtasks],
  );

  return {
    openSubtasks,
    doneSubtasks,
    progress: getSubtaskProgress(parentId === undefined ? task : { ...task, subtasks }),
    addSubtask,
    toggleSubtask,
    updateSubtask,
    removeSubtask,
    removeSubtasks,
    setSubtasksDone,
    duplicateSubtask,
    duplicateSubtasks,
    restoreSubtasks,
  };
}