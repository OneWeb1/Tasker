import { createId } from '@/shared/lib/utils/createId';
import type { Task, TaskSubtask } from '../../model/types/task';
import { updateSubtaskItem } from '../subtaskTree';
import type { SubtaskItemPatch } from '../subtaskTree';
import { appendFieldChanges } from '../taskChangeLog';
import { appendStatusChange } from '../taskHistory';
import { isRecurringTask } from '../taskOccurrence';

export interface SubtaskBounds {
  minDate: string;
  maxDate?: string;
  minTime?: string;
  maxTime?: string;
}

export const subtaskToTask = (subtask: TaskSubtask, parent: Task): Task => ({
  id: subtask.id,
  title: subtask.title,
  description: subtask.description,
  categoryId: parent.categoryId,
  projectId: parent.projectId,
  workspaceId: parent.workspaceId,
  date: subtask.date ?? parent.date,
  endDate: subtask.date === undefined ? (parent.endDate ?? null) : (subtask.endDate ?? null),
  startTime: subtask.startTime ?? null,
  endTime: subtask.endTime ?? null,
  status: subtask.done ? 'done' : 'active',
  priority: subtask.priority,
  subtasks: subtask.subtasks,
  checklists: subtask.checklists,
  comments: subtask.comments,
  attachments: subtask.attachments,
  createdAt: subtask.createdAt,
  statusLog: subtask.statusLog,
  changeLog: subtask.changeLog,
});

export const resolveSubtaskTask = (
  root: Task,
  id: string,
): { task: Task; parent: Task } | undefined => {
  const find = (
    items: readonly TaskSubtask[],
    parent: Task,
  ): { task: Task; parent: Task } | undefined => {
    for (const item of items) {
      const task = subtaskToTask(item, parent);
      if (item.id === id) return { task, parent };
      const found = item.subtasks ? find(item.subtasks, task) : undefined;
      if (found) return found;
    }
    return undefined;
  };

  return find(root.subtasks ?? [], root);
};

export const getSubtaskBounds = (parent: Task): SubtaskBounds => {
  const hasRange = Boolean(parent.endDate) && (parent.endDate ?? '') > parent.date;

  return {
    minDate: parent.date,
    maxDate: isRecurringTask(parent) ? undefined : hasRange ? (parent.endDate ?? undefined) : parent.date,
    minTime: parent.startTime ?? undefined,
    maxTime: parent.endTime ?? undefined,
  };
};

export interface SubtaskTimeLimits {
  minTime?: string;
  maxTime?: string;
}

export const getSubtaskTimeLimits = (
  bounds: Partial<SubtaskBounds>,
  start: string,
  end: string | null,
): SubtaskTimeLimits => {
  const isOpenEnded = bounds.maxDate === undefined;

  return {
    minTime: isOpenEnded || start === bounds.minDate ? bounds.minTime : undefined,
    maxTime: isOpenEnded || (end ?? start) === bounds.maxDate ? bounds.maxTime : undefined,
  };
};

export const stampNewSubtask = (
  draft: Omit<TaskSubtask, 'id'>,
  now: number,
): Omit<TaskSubtask, 'id'> => ({
  ...draft,
  createdAt: now,
  statusLog: [{ id: createId(), status: draft.done ? 'done' : 'active', changedAt: now }],
});

export const patchSubtask = (
  root: Task,
  id: string,
  patch: SubtaskItemPatch,
  now: number,
): TaskSubtask[] => {
  const items = root.subtasks ?? [];
  const resolved = resolveSubtaskTask(root, id);
  if (!resolved) return items;

  const current = resolved.task;
  const { done, ...fields } = patch;
  const { changeLog } = appendFieldChanges(current, fields, now);
  const isStatusChange = done !== undefined && done !== (current.status === 'done');
  const { statusLog } = isStatusChange
    ? appendStatusChange(current, done ? 'done' : 'active', now)
    : { statusLog: undefined };

  return updateSubtaskItem(items, id, {
    ...patch,
    ...(changeLog ? { changeLog } : {}),
    ...(statusLog ? { statusLog } : {}),
  });
};