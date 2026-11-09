import { useMemo } from 'react';
import { useGetCategoriesQuery } from '@/entities/category';
import type { Category } from '@/entities/category';
import {
  calculateRangeProgress,
  collectTaskTimeEntries,
  filterByProject,
  groupTasksByCategory,
  useGetTasksQuery,
} from '@/entities/task';
import type { TaskProgress } from '@/entities/task';
import { filterByWorkspace } from '@/entities/workspace';
import { useActiveProject } from '@/features/project/filterByProject';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';

const MS_IN_MINUTE = 60_000;

export interface PeriodCategoryRow {
  category: Category;
  progress: TaskProgress;
}

export function usePeriodDetails(from: string, to: string) {
  const { data: tasks } = useGetTasksQuery();
  const { data: categories } = useGetCategoriesQuery();
  const { workspace } = useActiveWorkspace();
  const { activeProjectId } = useActiveProject();

  return useMemo(() => {
    const scoped = filterByProject(filterByWorkspace(tasks ?? [], workspace.id), activeProjectId);
    const spentMs = collectTaskTimeEntries(scoped, { from, to }).reduce(
      (sum, entry) => sum + entry.durationMs,
      0,
    );
    const categoryRows: PeriodCategoryRow[] = groupTasksByCategory(scoped, categories ?? [])
      .map((group) => ({
        category: group.category,
        progress: calculateRangeProgress(group.tasks, from, to),
      }))
      .filter((row) => row.progress.total > 0);

    return {
      progress: calculateRangeProgress(scoped, from, to),
      spentMinutes: Math.round(spentMs / MS_IN_MINUTE),
      categoryRows,
    };
  }, [activeProjectId, categories, from, tasks, to, workspace.id]);
}