import type { Task } from '@/entities/task';
import { resolveWorkspaceId } from '@/entities/workspace';

export const collectCategoryTasks = (
  tasks: readonly Task[],
  categoryId: string,
  workspaceId: string,
): Task[] =>
  tasks.filter(
    (task) =>
      task.categoryId === categoryId && resolveWorkspaceId(task.workspaceId) === workspaceId,
  );