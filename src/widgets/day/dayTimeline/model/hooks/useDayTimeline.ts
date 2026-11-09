import { useCallback, useMemo } from 'react';
import { useGetCategoriesQuery } from '@/entities/category';
import { useGetEventsQuery } from '@/entities/event';
import type { CalendarEvent } from '@/entities/event';
import { useGetProjectsQuery } from '@/entities/project';
import {
  collectScheduledSubtasks,
  filterByProject,
  filterTasksByDate,
  isTaskDoneOn,
  useGetTasksQuery,
} from '@/entities/task';
import { filterByWorkspace } from '@/entities/workspace';
import { useCreateItem } from '@/features/createItem';
import { useCollapsedEvents } from '@/features/day/collapseEvents';
import { matchesQuery, useDaySearch } from '@/features/day/searchDay';
import { useSelectedDate } from '@/features/day/selectDate';
import { useActiveProject } from '@/features/project/filterByProject';
import { useConnectedCalendars } from '@/features/settings/connectCalendars';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
import { buildTaskPath } from '@/shared/config/routePaths';
import { useHashPath } from '@/shared/lib/hooks/useHashPath';
import { timeToMinutes } from '@/shared/lib/utils/date';
import { applyCollapse } from '../lib/applyCollapse';
import { buildTimelineRows } from '../lib/buildTimelineRows';
import { locateNowMarker } from '../lib/locateNowMarker';
import { useNowMinutes } from './useNowMinutes';

export function useDayTimeline() {
  const { selectedDate } = useSelectedDate();
  const { query } = useDaySearch();
  const { connectedSources } = useConnectedCalendars();
  const { data: events } = useGetEventsQuery();
  const { data: tasks } = useGetTasksQuery();
  const { data: projects } = useGetProjectsQuery();
  const { data: categories } = useGetCategoriesQuery();
  const { workspace } = useActiveWorkspace();
  const workspaceId = workspace.id;
  const { activeProjectId } = useActiveProject();
  const [, navigate] = useHashPath();
  const { open: openCreateItem } = useCreateItem();
  const { collapsedIds, toggle: toggleCollapse } = useCollapsedEvents();
  const now = useNowMinutes();
  const nowMinutes = now.dateKey === selectedDate ? now.minutes : null;

  const timeline = useMemo(() => {
    const projectsById = new Map((projects ?? []).map((project) => [project.id, project] as const));
    const categoriesById = new Map(
      (categories ?? []).map((category) => [category.id, category] as const),
    );

    const externalEvents = (events ?? []).filter(
      (event) =>
        event.date === selectedDate &&
        connectedSources.some((source) => source === event.source) &&
        (activeProjectId === null || event.projectId === activeProjectId),
    );

    const workspaceTasks = filterByProject(
      filterByWorkspace(tasks ?? [], workspaceId),
      activeProjectId,
    );

    const scheduledTasks = filterTasksByDate(workspaceTasks, selectedDate).flatMap(
      (task): CalendarEvent[] =>
        task.startTime && task.endTime && task.status !== 'postponed'
          ? [
              {
                id: task.id,
                title: task.title,
                categoryId: task.categoryId,
                projectId: task.projectId,
                date: task.date,
                startTime: task.startTime,
                endTime: task.endTime,
                source: 'local',
                isDone: isTaskDoneOn(task, selectedDate),
              },
            ]
          : [],
    );

    const scheduledSubtasks = workspaceTasks.flatMap((task) =>
      collectScheduledSubtasks(task, selectedDate),
    );
    const subtaskEvents = scheduledSubtasks.map(
      (item): CalendarEvent => ({
        id: item.id,
        title: item.title,
        categoryId: item.categoryId,
        projectId: item.projectId,
        date: selectedDate,
        startTime: item.startTime,
        endTime: item.endTime,
        source: 'local',
        isDone: item.isDone,
      }),
    );
    const taskIds = new Map(scheduledSubtasks.map((item) => [item.id, item.taskId] as const));
    const ancestorIds = new Map(
      scheduledSubtasks.map((item) => [item.id, item.ancestorIds] as const),
    );

    const allEvents = [...scheduledTasks, ...subtaskEvents, ...externalEvents];
    const entries = allEvents
      .filter((event) => matchesQuery(query, event.title))
      .map((event) => ({
        event,
        project: event.projectId ? projectsById.get(event.projectId) : undefined,
        categoryColor: categoriesById.get(event.categoryId)?.color,
        start: timeToMinutes(event.startTime),
        end: timeToMinutes(event.endTime),
        ancestorIds: ancestorIds.get(event.id) ?? [],
      }));
    const rows = buildTimelineRows(applyCollapse(entries, collapsedIds));
    const markerRows = rows.map((row) => ({
      ...row,
      items: row.items.filter((item) => !item.isHidden),
    }));

    return {
      rows,
      markerRows,
      isEmpty: entries.length === 0,
      count: allEvents.length,
      taskIds,
    };
  }, [
    activeProjectId,
    categories,
    collapsedIds,
    connectedSources,
    events,
    projects,
    query,
    selectedDate,
    tasks,
    workspaceId,
  ]);

  const { taskIds } = timeline;
  const nowMarker = useMemo(
    () => locateNowMarker(timeline.markerRows, nowMinutes),
    [nowMinutes, timeline.markerRows],
  );
  const openTask = useCallback(
    (id: string) => {
      const rootId = taskIds.get(id);
      navigate(rootId ? buildTaskPath(rootId, id) : buildTaskPath(id));
    },
    [navigate, taskIds],
  );
  const createTask = useCallback(() => openCreateItem({ kind: 'task' }), [openCreateItem]);

  return {
    rows: timeline.rows,
    isEmpty: timeline.isEmpty,
    count: timeline.count,
    nowMarker,
    openTask,
    createTask,
    toggleCollapse,
  };
}