import { useCallback, useMemo, useState } from 'react';
import type { Category } from '@/entities/category';
   import {
     calculateTaskProgress,
     calculateTaskStats,
     calculateWeekProgress,
     filterByProject,
     useGetTasksQuery,
   } from '@/entities/task';
   import type { Task, TaskProgress } from '@/entities/task';
   import { filterByWorkspace } from '@/entities/workspace';
import { useSelectedDate } from '@/features/day/selectDate';
   import { useActiveProject } from '@/features/project/filterByProject';
   import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
   import { usePresenceList } from '@/shared/lib/hooks/usePresenceList';
import { addDaysToKey, getTodayKey, parseDateKey } from '@/shared/lib/utils/date';
import { readValue, writeValue } from '@/shared/lib/utils/storage';

const PROGRESS_EXPANDED_KEY = 'progressSummaryExpanded';
const CATEGORY_ROW_EXIT_MS = 260;

const STATS_DAY_FORMAT = new Intl.DateTimeFormat('uk-UA', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
});
const STATS_DAY_YEAR_FORMAT = new Intl.DateTimeFormat('uk-UA', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const getCategoryRowKey = (row: { category: Category }): string => row.category.id;

const readExpanded = (): boolean => {
  const stored = readValue<unknown>(PROGRESS_EXPANDED_KEY, false);
  return typeof stored === 'boolean' ? stored : false;
};

interface ProgressSummaryGroup {
  category: Category;
  progress: TaskProgress;
  items: readonly { task: Task }[];
}

export function useProgressSummary(
  groups: readonly ProgressSummaryGroup[],
  statsDate: string,
  onSelectDate: (dateKey: string) => void,
) {
   const { data: tasks } = useGetTasksQuery();
   const { workspace } = useActiveWorkspace();
   const { activeProjectId } = useActiveProject();
const workspaceId = workspace.id;
   const { bounds } = useSelectedDate();
   const scopedTasks = useMemo(
     () => filterByProject(filterByWorkspace(tasks ?? [], workspaceId), activeProjectId),
     [tasks, workspaceId, activeProjectId],
   );
   const [weekOffset, setWeekOffset] = useState(0);
  const statsDateLabel = useMemo(() => {
    const date = parseDateKey(statsDate);
    const isCurrentYear = date.getFullYear() === parseDateKey(getTodayKey()).getFullYear();
    return (isCurrentYear ? STATS_DAY_FORMAT : STATS_DAY_YEAR_FORMAT).format(date);
  }, [statsDate]);
  const [isExpanded, setIsExpanded] = useState(readExpanded);
  const [hasBeenExpanded, setHasBeenExpanded] = useState(isExpanded);

  const toggle = useCallback(() => {
    setIsExpanded((previous) => {
      const next = !previous;
      writeValue(PROGRESS_EXPANDED_KEY, next);
      return next;
    });
    setHasBeenExpanded(true);
  }, []);

  const statsTasks = useMemo(
    () => groups.flatMap((group) => group.items.map((item) => item.task)),
    [groups],
  );

  const totalProgress = useMemo(
    () => calculateTaskProgress(statsTasks, statsDate),
    [statsTasks, statsDate],
  );

  const stats = useMemo(
    () => calculateTaskStats(statsTasks, statsDate),
    [statsTasks, statsDate],
  );

  const categoryRows = useMemo(
    () =>
      groups
        .filter((group) => group.items.length > 0)
        .map(({ category, progress }) => ({ category, progress })),
    [groups],
  );

  const categoryEntries = usePresenceList(categoryRows, getCategoryRowKey, CATEGORY_ROW_EXIT_MS);

  const selectStatsDate = useCallback(
    (dateKey: string) => {
      onSelectDate(dateKey);
      setWeekOffset(0);
    },
    [onSelectDate],
  );

  const shiftWeek = useCallback((direction: 1 | -1) => {
    setWeekOffset((previous) => previous + direction);
  }, []);

  const weekPanels = useMemo(() => {
    if (!hasBeenExpanded) return null;
   const today = getTodayKey();
   const buildWeek = (weeksFromSelected: number) =>
     calculateWeekProgress(scopedTasks, addDaysToKey(statsDate, weeksFromSelected * 7)).map(
        (day) => ({
          ...day,
          isSelected: day.dateKey === statsDate,
          isToday: day.dateKey === today,
          isFuture: day.dateKey > today,
          isDisabled: bounds !== null && (day.dateKey < bounds.from || day.dateKey > bounds.to),
        }),
      );

    return {
      previous: buildWeek(weekOffset - 1),
      current: buildWeek(weekOffset),
      next: buildWeek(weekOffset + 1),
    };

}, [bounds, hasBeenExpanded, statsDate, scopedTasks, weekOffset]);

  const canShiftPreviousWeek = weekPanels?.previous.some((day) => !day.isDisabled) ?? true;
  const canShiftNextWeek = weekPanels?.next.some((day) => !day.isDisabled) ?? true;

  return {
    isExpanded,
    toggle,
    statsDate,
    statsDateLabel,
    totalProgress,
    stats,
    categoryEntries,
    weekPanels,
    canShiftPreviousWeek,
    canShiftNextWeek,
    shiftWeek,
    selectStatsDate,
  };
}