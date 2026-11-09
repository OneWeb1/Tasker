import { isRecurringTask } from '@/entities/task';
import type { Task } from '@/entities/task';

export const isMovableTask = (task: Task): boolean =>
  !isRecurringTask(task) && task.status === 'active';