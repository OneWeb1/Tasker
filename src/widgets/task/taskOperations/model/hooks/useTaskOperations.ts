import { useCallback, useMemo } from 'react';
import {
  DEFAULT_CATEGORY_ID,
  filterCategoriesByWorkspace,
  useGetCategoriesQuery,
} from '@/entities/category';
import { collectTaskTimeEntries, filterByProject, useGetTasksQuery } from '@/entities/task';
import type { Task, TaskTimeRange } from '@/entities/task';
import { filterByWorkspace } from '@/entities/workspace';
import { useActiveProject } from '@/features/project/filterByProject';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
import { buildTaskPath } from '@/shared/config/routePaths';
import { useHashPath } from '@/shared/lib/hooks/useHashPath';
import { groupEntriesByDate } from '../lib/groupEntriesByDate';

const PREVIEW_COUNT = 3;

export function useTaskOperations(range: TaskTimeRange | null) {
  const { data: tasks } = useGetTasksQuery();
  const { data: allCategories } = useGetCategoriesQuery();
  const { workspace } = useActiveWorkspace();
  const { activeProjectId } = useActiveProject();
  const [, navigate] = useHashPath();


  const from = range?.from;
  const to = range?.to;

  const entries = useMemo(
    () =>
      collectTaskTimeEntries(
        filterByProject(filterByWorkspace(tasks ?? [], workspace.id), activeProjectId),
        from !== undefined && to !== undefined ? { from, to } : null,
      ),
    [activeProjectId, from, tasks, to, workspace.id],
  );

  const categoriesById = useMemo(
    () =>
      new Map(
        filterCategoriesByWorkspace(allCategories ?? [], workspace.id).map(
          (category) => [category.id, category] as const,
        ),
      ),
    [allCategories, workspace.id],
  );

  const resolveCategory = useCallback(
    (task: Task) =>
      categoriesById.get(task.categoryId) ?? categoriesById.get(DEFAULT_CATEGORY_ID),
    [categoriesById],
  );

  const groups = useMemo(() => groupEntriesByDate(entries), [entries]);
  const totalMs = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.durationMs, 0),
    [entries],
  );



  const openTask = useCallback(
    (task: Task) => {
      navigate(buildTaskPath(task.id));
    },
    [navigate],
  );

  return {
    items: entries.slice(0, PREVIEW_COUNT),
    resolveCategory,
    openTask,
    groups,
    totalMs,
  };
}