import { DEFAULT_CATEGORY_ID } from '@/entities/category';
import type { Category } from '@/entities/category';
import type { Task } from '../../model/types/task';

export interface TaskGroup {
  category: Category;
  tasks: Task[];
}

export const groupTasksByCategory = (
  tasks: readonly Task[],
  categories: readonly Category[],
): TaskGroup[] => {
  const knownIds = new Set(categories.map((category) => category.id));

  return categories.map((category) => ({
    category,
    tasks: tasks.filter(
      (task) =>
        task.categoryId === category.id ||
        (category.id === DEFAULT_CATEGORY_ID && !knownIds.has(task.categoryId)),
    ),
  }));
};