import type { TaskChecklistItem } from '../../model/types/task';

export interface ChecklistItemCount {
  done: number;
  total: number;
}

export const updateChecklistItem = (
  items: readonly TaskChecklistItem[],
  id: string,
  update: (item: TaskChecklistItem) => TaskChecklistItem,
): TaskChecklistItem[] =>
  items.map((item) => {
    if (item.id === id) return update(item);
    if (!item.children) return item;
    return { ...item, children: updateChecklistItem(item.children, id, update) };
  });

export const removeChecklistItem = (
  items: readonly TaskChecklistItem[],
  id: string,
): TaskChecklistItem[] =>
  items
    .filter((item) => item.id !== id)
    .map((item) =>
      item.children ? { ...item, children: removeChecklistItem(item.children, id) } : item,
    );

export const toggleChecklistItem = (
  items: readonly TaskChecklistItem[],
  id: string,
): TaskChecklistItem[] => updateChecklistItem(items, id, (item) => ({ ...item, done: !item.done }));

export const addChecklistChild = (
  items: readonly TaskChecklistItem[],
  parentId: string,
  child: TaskChecklistItem,
): TaskChecklistItem[] =>
  updateChecklistItem(items, parentId, (item) => ({
    ...item,
    children: [...(item.children ?? []), child],
  }));

export const countChecklistItems = (items: readonly TaskChecklistItem[]): ChecklistItemCount =>
  items.reduce<ChecklistItemCount>(
    (count, item) => {
      const nested = item.children ? countChecklistItems(item.children) : { done: 0, total: 0 };
      return {
        done: count.done + (item.done ? 1 : 0) + nested.done,
        total: count.total + 1 + nested.total,
      };
    },
    { done: 0, total: 0 },
  );