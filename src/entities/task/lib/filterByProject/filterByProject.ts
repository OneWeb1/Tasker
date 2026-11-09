import type { Task } from '../../model/types/task';

export const filterByProject = (tasks: readonly Task[], projectId: string | null): Task[] =>
  projectId === null ? [...tasks] : tasks.filter((task) => task.projectId === projectId);