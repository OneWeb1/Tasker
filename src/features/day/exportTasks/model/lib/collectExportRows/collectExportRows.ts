import { DEFAULT_CATEGORY_ID } from '@/entities/category';
import type { Category } from '@/entities/category';
import type { Project } from '@/entities/project';
import { filterTasksByDate, getTaskScheduleLabel, isTaskDoneOn } from '@/entities/task';
import type { Task } from '@/entities/task';
import { getDateRange } from '@/shared/lib/utils/date';
import type { ExportRow } from '../../types/exportRow';

const NO_TIME_SORT_KEY = '99:99';

export const collectExportRows = (
  tasks: readonly Task[],
  categories: readonly Category[],
  projects: readonly Project[],
  from: string,
  to: string,
): ExportRow[] => {
  const categoryTitles = new Map(categories.map((category) => [category.id, category.title] as const));
  const projectTitles = new Map(projects.map((project) => [project.id, project.title] as const));
  const fallbackCategory = categoryTitles.get(DEFAULT_CATEGORY_ID) ?? '';
  const activeTasks = tasks.filter((task) => task.status !== 'postponed');

  return getDateRange(from, to).flatMap((date) =>
    filterTasksByDate(activeTasks, date)
      .sort((a, b) =>
        (a.startTime ?? NO_TIME_SORT_KEY).localeCompare(b.startTime ?? NO_TIME_SORT_KEY),
      )
      .map((task) => ({
        date,
        time: task.startTime && task.endTime ? `${task.startTime}–${task.endTime}` : '',
        title: task.title,
        description: task.description ?? '',
        category: categoryTitles.get(task.categoryId) ?? fallbackCategory,
        project: task.projectId ? (projectTitles.get(task.projectId) ?? '') : '',
        schedule: getTaskScheduleLabel(task),
        isDone: isTaskDoneOn(task, date),
      })),
  );
};