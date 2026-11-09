import { useCallback, useState } from 'react';
import { TASK_SCHEDULES, isRecurringSchedule, useGetTasksQuery } from '@/entities/task';
import type { TaskPriority, TaskSchedule } from '@/entities/task';
import { filterByWorkspace } from '@/entities/workspace';
import { useCreateItem, useCreateItemForm } from '@/features/createItem';
import { useActiveProject } from '@/features/project/filterByProject';
import type { TaskDates } from '@/features/task/editTask';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';

export type TaskEditorSheet =
  | 'dates'
  | 'priority'
  | 'project'
  | 'schedule'
  | 'category'
  | 'workspace';

export function useTaskEditor(defaultDate: string) {
  const { workspace: activeWorkspace, workspaces } = useActiveWorkspace();
  const { activeProjectId } = useActiveProject();
  const form = useCreateItemForm(defaultDate, activeWorkspace.id, activeProjectId ?? '');
  const { task: editingTask } = useCreateItem();
  const { data: tasks } = useGetTasksQuery();
  const {
    date,
    endDate,
    hasTime,
    startTime,
    endTime,
    projects,
    projectId,
    workspaceId,
    categories,
    category,
    setCategory,
    schedule,
    setDate,
    setEndDate,
    setHasTime,
    setStartTime,
    setEndTime,
    setPriority,
    setProjectId,
    setWorkspaceId,
    setSchedule,
  } = form;
  const [sheet, setSheet] = useState<TaskEditorSheet | null>(null);
  const [isContentOpen, setIsContentOpen] = useState(false);

  const openSheet = useCallback((next: TaskEditorSheet) => setSheet(next), []);
  const closeSheet = useCallback(() => setSheet(null), []);
  const openContent = useCallback(() => setIsContentOpen(true), []);
  const closeContent = useCallback(() => setIsContentOpen(false), []);

  const changeDates = useCallback(
    (dates: TaskDates) => {
      setDate(dates.date);
      setEndDate(dates.endDate ?? null);
      const nextHasTime = dates.startTime !== null && dates.endTime !== null;
      setHasTime(nextHasTime);
      if (dates.startTime !== null && dates.endTime !== null) {
        setStartTime(dates.startTime);
        setEndTime(dates.endTime);
      }
      setSheet(null);
    },
    [setDate, setEndDate, setEndTime, setHasTime, setStartTime],
  );

  const changePriority = useCallback(
    (value: TaskPriority | undefined) => {
      setPriority(value);
      setSheet(null);
    },
    [setPriority],
  );

  const changeProject = useCallback(
    (value: string) => {
      setProjectId(value);
      setSheet(null);
    },
    [setProjectId],
  );

  const changeWorkspace = useCallback(
    (value: string) => {
      setWorkspaceId(value);
      if (!filterByWorkspace(projects, value).some((item) => item.id === projectId)) {
        setProjectId('');
      }
      setSheet(null);
    },
    [projects, projectId, setProjectId, setWorkspaceId],
  );

  const changeSchedule = useCallback(
    (value: TaskSchedule) => {
      setSchedule(value);
      setSheet(null);
    },
    [setSchedule],
  );

  const changeCategory = useCallback(
    (value: string) => {
      setCategory(value);
      setSheet(null);
    },
    [setCategory],
  );

  const dates: TaskDates = {
    date,
    endDate,
    startTime: hasTime ? startTime : null,
    endTime: hasTime ? endTime : null,
  };

  const contentTask = editingTask
    ? (tasks?.find((item) => item.id === editingTask.id) ?? editingTask)
    : form.draftTask;

  return {
    ...form,
    dates,
    contentTask,
    project: projects.find((item) => item.id === projectId),
    projects: filterByWorkspace(projects, workspaceId),
    workspaces,
    selectedWorkspace: workspaces.find((item) => item.id === workspaceId),
    selectedCategory: categories.find((item) => item.id === category),
    scheduleLabel: TASK_SCHEDULES.find((item) => item.value === schedule)?.label ?? '',
    isRecurring: isRecurringSchedule(schedule),
    sheet,
    openSheet,
    closeSheet,
    isContentOpen,
    openContent,
    closeContent,
    changeDates,
    changePriority,
    changeProject,
    changeWorkspace,
    changeSchedule,
    changeCategory,
  };
}

export type TaskEditor = ReturnType<typeof useTaskEditor>;