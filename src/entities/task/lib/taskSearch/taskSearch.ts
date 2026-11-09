import type { Task, TaskSubtask } from '../../model/types/task';
import type { TaskPriority } from '../../model/types/taskPriority';
import type { TaskStatus } from '../../model/types/taskStatus';
import { isTaskDoneOn } from '../taskOccurrence';

export type TaskSearchKind = 'task' | 'subtask';

export interface TaskSearchEntry {
  id: string;
  kind: TaskSearchKind;
  rootId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  categoryId: Task['categoryId'];
  projectId: string | null;
  parentTitle: string | null;
  date: string;
  createdAt: number;
}

const collectSubtasks = (
  items: readonly TaskSubtask[],
  root: Task,
  parentTitle: string,
  out: TaskSearchEntry[],
): void => {
  for (const item of items) {
    out.push({
      id: item.id,
      kind: 'subtask',
      rootId: root.id,
      title: item.title,
      description: item.description,
      status: item.done ? 'done' : 'active',
      priority: item.priority,
      categoryId: root.categoryId,
      projectId: root.projectId,
      parentTitle,
      date: item.date ?? root.date,
      createdAt: item.createdAt ?? root.createdAt ?? 0,
    });
    if (item.subtasks) collectSubtasks(item.subtasks, root, item.title, out);
  }
};

export const buildTaskSearchEntries = (
  tasks: readonly Task[],
  dateKey: string,
): TaskSearchEntry[] => {
  const entries: TaskSearchEntry[] = [];

  for (const task of tasks) {
    entries.push({
      id: task.id,
      kind: 'task',
      rootId: task.id,
      title: task.title,
      description: task.description,
      status: isTaskDoneOn(task, dateKey)
        ? 'done'
        : task.status === 'postponed'
          ? 'postponed'
          : 'active',
      priority: task.priority,
      categoryId: task.categoryId,
      projectId: task.projectId,
      parentTitle: null,
      date: task.date,
      createdAt: task.createdAt ?? 0,
    });
    if (task.subtasks) collectSubtasks(task.subtasks, task, task.title, entries);
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
};