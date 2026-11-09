import { timeToMinutes } from '@/shared/lib/utils/date';
import type { Task, TaskSubtask } from '../../model/types/task';
import { isTaskDoneOn } from '../taskOccurrence';

export interface TaskTimeEntry {
  id: string;
  task: Task;
  title: string;
  subtaskId?: string;
  dateKey: string;
  durationMs: number;
}

interface SortableEntry {
  entry: TaskTimeEntry;
  createdAt: number;
}

export interface TaskTimeRange {
  from: string;
  to: string;
}

const MS_IN_MINUTE = 60_000;

const isInRange = (dateKey: string, range: TaskTimeRange | null | undefined): boolean =>
  !range || (dateKey >= range.from && dateKey <= range.to);

const getScheduledMs = ({
  startTime,
  endTime,
}: {
  startTime?: string | null;
  endTime?: string | null;
}): number => {
  if (!startTime || !endTime) return 0;

  const minutes = timeToMinutes(endTime) - timeToMinutes(startTime);
  return minutes > 0 ? minutes * MS_IN_MINUTE : 0;
};

const collectSubtaskEntries = (
  task: Task,
  items: readonly TaskSubtask[],
  inheritedDate: string,
  range: TaskTimeRange | null | undefined,
): SortableEntry[] =>
  items.flatMap((item) => {
    const dateKey = item.date ?? inheritedDate;
    const durationMs = getScheduledMs(item);
    const own: SortableEntry[] =
      item.done && durationMs > 0 && isInRange(dateKey, range)
        ? [
            {
              entry: {
                id: `${task.id}:${item.id}:${dateKey}`,
                task,
                title: item.title,
                subtaskId: item.id,
                dateKey,
                durationMs,
              },
              createdAt: item.createdAt ?? task.createdAt ?? 0,
            },
          ]
        : [];
    const nested = item.subtasks
      ? collectSubtaskEntries(task, item.subtasks, dateKey, range)
      : [];

    return [...own, ...nested];
  });

const getCandidateDates = (task: Task): string[] => [
  ...new Set([task.date, ...(task.completedDates ?? [])]),
];

export const collectTaskTimeEntries = (
  tasks: readonly Task[],
  range?: TaskTimeRange | null,
): TaskTimeEntry[] =>
  tasks
    .flatMap((task): SortableEntry[] => {
      const durationMs = getScheduledMs(task);
      const own: SortableEntry[] =
        durationMs === 0
          ? []
          : getCandidateDates(task)
              .filter((dateKey) => isInRange(dateKey, range) && isTaskDoneOn(task, dateKey))
              .map((dateKey) => ({
                entry: {
                  id: `${task.id}:${dateKey}`,
                  task,
                  title: task.title,
                  dateKey,
                  durationMs,
                },
                createdAt: task.createdAt ?? 0,
              }));
      const nested =
        task.status === 'postponed'
          ? []
          : collectSubtaskEntries(task, task.subtasks ?? [], task.date, range);

      return [...own, ...nested];
    })
    .sort(
      (a, b) =>
        b.entry.dateKey.localeCompare(a.entry.dateKey) || b.createdAt - a.createdAt,
    )
    .map(({ entry }) => entry);