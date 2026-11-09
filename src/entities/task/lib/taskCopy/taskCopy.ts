import type { NewTask, Task } from '../../model/types/task';

export const buildTaskCopy = (task: Task, overrides: Partial<NewTask> = {}): NewTask => ({
  title: task.title,
  categoryId: task.categoryId,
  projectId: task.projectId,
  date: task.date,
  startTime: task.startTime,
  endTime: task.endTime,
  status: 'active',
  ...(task.description !== undefined && { description: task.description }),
  ...(task.endDate !== undefined && { endDate: task.endDate }),
  ...(task.schedule !== undefined && { schedule: task.schedule }),
  ...(task.weekdays !== undefined && { weekdays: task.weekdays }),
  ...(task.workspaceId !== undefined && { workspaceId: task.workspaceId }),
  ...overrides,
});