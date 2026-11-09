import { useMemo } from 'react';
import { useGetEventsQuery } from '@/entities/event';
import {
  collectScheduledSubtasks,
  filterByProject,
  forEachOccurrence,
  useGetTasksQuery,
} from '@/entities/task';
import { filterByWorkspace } from '@/entities/workspace';
import { useSelectedDate } from '@/features/day/selectDate';
import { useActiveProject } from '@/features/project/filterByProject';
import { useConnectedCalendars } from '@/features/settings/connectCalendars';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
import { getDateRange } from '@/shared/lib/utils/date';
import type { DateRange } from '@/shared/lib/utils/date';

export function useDayEventsCount(range: DateRange | null): number {
  const { selectedDate } = useSelectedDate();
  const { connectedSources } = useConnectedCalendars();
  const { data: events } = useGetEventsQuery();
  const { data: tasks } = useGetTasksQuery();
  const { workspace } = useActiveWorkspace();
  const { activeProjectId } = useActiveProject();
  const workspaceId = workspace.id;
  const from = range?.from ?? selectedDate;
  const to = range?.to ?? selectedDate;

  return useMemo(() => {
    const eventIds = new Set<string>();
    const externalEvents = (events ?? []).filter(
      (event) =>
        event.date >= from &&
        event.date <= to &&
        connectedSources.some((source) => source === event.source) &&
        (activeProjectId === null || event.projectId === activeProjectId),
    );
    for (const event of externalEvents) eventIds.add(event.id);

    const workspaceTasks = filterByProject(
      filterByWorkspace(tasks ?? [], workspaceId),
      activeProjectId,
    );

    forEachOccurrence(workspaceTasks, from, to, (task) => {
      if (task.startTime && task.endTime && task.status !== 'postponed') eventIds.add(task.id);
    });

    const tasksWithSubtasks = workspaceTasks.filter((task) => task.subtasks?.length);
    if (tasksWithSubtasks.length > 0) {
      for (const dateKey of getDateRange(from, to)) {
        for (const task of tasksWithSubtasks) {
          for (const subtask of collectScheduledSubtasks(task, dateKey)) eventIds.add(subtask.id);
        }
      }
    }

    return eventIds.size;

  }, [activeProjectId, connectedSources, events, from, tasks, to, workspaceId]);
}