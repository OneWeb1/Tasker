import { useMemo } from 'react';
import { useGetCategoriesQuery } from '@/entities/category';
import type { CategoryId } from '@/entities/category';
import {
  calculateRangeProgress,
  collectTaskTimeEntries,
  filterByProject,
  forEachOccurrence,
  groupTasksByCategory,
  isTaskDoneOn,
  useGetTasksQuery,
} from '@/entities/task';
import { filterByWorkspace } from '@/entities/workspace';
import { useActiveProject } from '@/features/project/filterByProject';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
import { getTodayKey, timeToMinutes } from '@/shared/lib/utils/date';

const MS_IN_MINUTE = 60_000;

export interface CategoryHistoryEntry {
  id: string;
  taskId: string;
  title: string;
  isDone: boolean;
  timeLabel: string | null;
  spentMinutes: number | null;
}

export interface CategoryHistoryGroup {
  dateKey: string;
  entries: CategoryHistoryEntry[];
}

export function useCategoryDetails(categoryId: CategoryId | null, from: string, to: string) {
  const { data: tasks } = useGetTasksQuery();
  const { data: categories } = useGetCategoriesQuery();
  const { workspace } = useActiveWorkspace();
  const { activeProjectId } = useActiveProject();

  return useMemo(() => {
    if (categoryId === null) return null;

    const scoped = filterByProject(filterByWorkspace(tasks ?? [], workspace.id), activeProjectId);
    const categoryTasks =
      groupTasksByCategory(scoped, categories ?? []).find(
        (group) => group.category.id === categoryId,
      )?.tasks ?? [];

    const today = getTodayKey();
    const byDate = new Map<string, CategoryHistoryEntry[]>();

    forEachOccurrence(categoryTasks, from, to, (task, dateKey) => {
      if (task.status === 'postponed' || dateKey > today) return;
      const entries = byDate.get(dateKey) ?? [];
      const isDone = isTaskDoneOn(task, dateKey);
      const scheduledMinutes =
        task.startTime && task.endTime
          ? timeToMinutes(task.endTime) - timeToMinutes(task.startTime)
          : 0;
      entries.push({
        id: `${task.id}:${dateKey}`,
        taskId: task.id,
        title: task.title,
        isDone,
        timeLabel: task.startTime && task.endTime ? `${task.startTime} – ${task.endTime}` : null,
        spentMinutes: isDone && scheduledMinutes > 0 ? scheduledMinutes : null,
      });
      byDate.set(dateKey, entries);
    });

    const history: CategoryHistoryGroup[] = [...byDate.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([dateKey, entries]) => ({ dateKey, entries }));

    const spentMs = collectTaskTimeEntries(categoryTasks, { from, to }).reduce(
      (sum, entry) => sum + entry.durationMs,
      0,
    );
    const progress = calculateRangeProgress(categoryTasks, from, to);

    return {
      progress,
      remaining: progress.total - progress.done,
      spentMinutes: Math.round(spentMs / MS_IN_MINUTE),
      history,
    };

  }, [activeProjectId, categories, categoryId, from, tasks, to, workspace.id]);
}