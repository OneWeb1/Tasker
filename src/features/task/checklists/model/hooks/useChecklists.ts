import { useCallback } from 'react';
import {
  addChecklistChild,
  removeChecklistItem,
  toggleChecklistItem,
  updateChecklistItem,
  useTaskPatch,
} from '@/entities/task';
import type { Task, TaskChecklist } from '@/entities/task';
import { createId } from '@/shared/lib/utils/createId';

const DEFAULT_TITLE = 'Чекліст';

export function useChecklists(task: Task) {
  const patchTask = useTaskPatch();
  const checklists = task.checklists ?? [];

  const save = useCallback(
    (next: TaskChecklist[]) => {
      patchTask(task.id, { checklists: next });
    },
    [task.id, patchTask],
  );

  const updateChecklist = useCallback(
    (id: string, update: (checklist: TaskChecklist) => TaskChecklist) => {
      save(checklists.map((checklist) => (checklist.id === id ? update(checklist) : checklist)));
    },
    [checklists, save],
  );

  const addChecklist = useCallback((): string => {
    const id = createId();
    save([...checklists, { id, title: `${DEFAULT_TITLE} ${checklists.length + 1}`, items: [] }]);
    return id;
  }, [checklists, save]);

  const renameChecklist = useCallback(
    (id: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      updateChecklist(id, (checklist) => ({ ...checklist, title: trimmed }));
    },
    [updateChecklist],
  );

  const removeChecklists = useCallback(
    (ids: readonly string[]) => {
      save(checklists.filter((checklist) => !ids.includes(checklist.id)));
    },
    [checklists, save],
  );

  const addItem = useCallback(
    (checklistId: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      updateChecklist(checklistId, (checklist) => ({
        ...checklist,
        items: [...checklist.items, { id: createId(), title: trimmed, done: false }],
      }));
    },
    [updateChecklist],
  );

  const toggleItem = useCallback(
    (checklistId: string, itemId: string) => {
      updateChecklist(checklistId, (checklist) => ({
        ...checklist,
        items: toggleChecklistItem(checklist.items, itemId),
      }));
    },
    [updateChecklist],
  );

  const removeItems = useCallback(
    (checklistId: string, itemIds: readonly string[]) => {
      updateChecklist(checklistId, (checklist) => ({
        ...checklist,
        items: itemIds.reduce((items, id) => removeChecklistItem(items, id), checklist.items),
      }));
    },
    [updateChecklist],
  );

  const addSubItem = useCallback(
    (checklistId: string, parentId: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      updateChecklist(checklistId, (checklist) => ({
        ...checklist,
        items: addChecklistChild(checklist.items, parentId, {
          id: createId(),
          title: trimmed,
          done: false,
        }),
      }));
    },
    [updateChecklist],
  );

  const renameItem = useCallback(
    (checklistId: string, itemId: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      updateChecklist(checklistId, (checklist) => ({
        ...checklist,
        items: updateChecklistItem(checklist.items, itemId, (item) => ({
          ...item,
          title: trimmed,
        })),
      }));
    },
    [updateChecklist],
  );

  return {
    checklists,
    addChecklist,
    renameChecklist,
    removeChecklists,
    addItem,
    addSubItem,
    renameItem,
    toggleItem,
    removeItems,
  };
}