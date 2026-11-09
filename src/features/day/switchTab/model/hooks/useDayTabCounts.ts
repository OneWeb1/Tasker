import { useMemo } from 'react';
import {
  filterByProject,
  forEachOccurrence,
  isRecurringTask,
  isTaskDoneOn,
  useGetTasksQuery,
} from '@/entities/task';
import { filterByWorkspace } from '@/entities/workspace';
import { getTodayKey } from '@/shared/lib/utils/date';
import type { DateRange } from '@/shared/lib/utils/date';

export interface DayTabCounts {
  all: number;
  postponed: number;
  tasks: number;
  done: number;
  overdue: number;
}

export function useDayTabCounts(
  dateKey: string,
  workspaceId: string,
  projectId: string | null,
  range?: DateRange | null,
): DayTabCounts {
  const { data: tasks } = useGetTasksQuery();
  const from = range?.from;
  const to = range?.to;

  return useMemo(() => {
    const all = filterByProject(filterByWorkspace(tasks ?? [], workspaceId), projectId);
    const isRange = from !== undefined && to !== undefined;
    const rangeFrom = isRange ? from : dateKey;
    const rangeTo = isRange ? to : dateKey;

    const scheduledIds = new Set<string>();
    const activeIds = new Set<string>();
    const doneIds = new Set<string>();
    const postponedIds = new Set<string>();

    forEachOccurrence(all, rangeFrom, rangeTo, (task, date) => {
      if (task.status === 'postponed') {
        postponedIds.add(task.id);
        return;
      }
      scheduledIds.add(task.id);
      if (isTaskDoneOn(task, date)) doneIds.add(task.id);
      else activeIds.add(task.id);
    });

    const postponed = isRange
      ? postponedIds.size
      : all.filter((task) => task.status === 'postponed').length;

    const todayKey = getTodayKey();
    const overdue = all.filter((task) => {
      if (isRecurringTask(task) || task.status === 'done' || task.status === 'postponed') {
        return false;
      }
      const due = task.endDate ?? task.date;
      if (due >= todayKey) return false;
      return (from === undefined || due >= from) && (to === undefined || due <= to);
    }).length;

    return {
      overdue,
      all: scheduledIds.size + postponed,
      postponed,
      tasks: activeIds.size,
      done: doneIds.size,
    };

  }, [tasks, dateKey, workspaceId, projectId, from, to]);
}