import { createId } from '@/shared/lib/utils/createId';
import type { TaskChecklist, TaskChecklistItem, TaskSubtask } from '../../model/types/task';

export type SubtaskItemPatch = Partial<Omit<TaskSubtask, 'id'>>;

export const findSubtask = (
  items: readonly TaskSubtask[],
  id: string,
): TaskSubtask | undefined => {
  for (const item of items) {
    if (item.id === id) return item;
    const found = item.subtasks ? findSubtask(item.subtasks, id) : undefined;
    if (found) return found;
  }
  return undefined;
};

export const findSubtaskParentId = (
  items: readonly TaskSubtask[],
  id: string,
  parentId: string | null = null,
): string | null | undefined => {
  for (const item of items) {
    if (item.id === id) return parentId;
    const found = item.subtasks ? findSubtaskParentId(item.subtasks, id, item.id) : undefined;
    if (found !== undefined) return found;
  }
  return undefined;
};

const mapSubtask = (
  items: readonly TaskSubtask[],
  id: string,
  update: (item: TaskSubtask) => TaskSubtask,
): TaskSubtask[] =>
  items.map((item) => {
    if (item.id === id) return update(item);
    if (!item.subtasks) return item;
    return { ...item, subtasks: mapSubtask(item.subtasks, id, update) };
  });

export const updateSubtaskItem = (
  items: readonly TaskSubtask[],
  id: string,
  patch: SubtaskItemPatch,
): TaskSubtask[] => mapSubtask(items, id, (item) => ({ ...item, ...patch }));



export const removeSubtaskItem = (items: readonly TaskSubtask[], id: string): TaskSubtask[] =>
  items
    .filter((item) => item.id !== id)
    .map((item) =>
      item.subtasks ? { ...item, subtasks: removeSubtaskItem(item.subtasks, id) } : item,
    );

export const addSubtaskChild = (
  items: readonly TaskSubtask[],
  parentId: string | undefined,
  subtask: TaskSubtask,
): TaskSubtask[] => {
  if (parentId === undefined) return [...items, subtask];
  return mapSubtask(items, parentId, (item) => ({
    ...item,
    subtasks: [...(item.subtasks ?? []), subtask],
  }));
};

const cloneChecklistItem = (item: TaskChecklistItem): TaskChecklistItem => ({
  id: createId(),
  title: item.title,
  done: item.done,
  ...(item.children ? { children: item.children.map(cloneChecklistItem) } : {}),
});

const cloneChecklist = (checklist: TaskChecklist): TaskChecklist => ({
  id: createId(),
  title: checklist.title,
  items: checklist.items.map(cloneChecklistItem),
});

export const cloneSubtask = (item: TaskSubtask): TaskSubtask => ({
  ...item,
  id: createId(),
  subtasks: item.subtasks?.map(cloneSubtask),
  checklists: item.checklists?.map(cloneChecklist),
  comments: undefined,
  attachments: undefined,
  createdAt: undefined,
  statusLog: undefined,
  changeLog: undefined,
});