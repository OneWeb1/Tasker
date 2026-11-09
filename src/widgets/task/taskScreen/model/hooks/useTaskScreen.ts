   import { useCallback, useMemo, useRef, useState } from 'react';
import { useGetCategoriesQuery } from '@/entities/category';
import { useGetProjectsQuery } from '@/entities/project';
import { buildTaskDetails, isRecurringTask, useGetTasksQuery } from '@/entities/task';
import type { TaskDetailsStatus } from '@/entities/task';
import { resolveWorkspaceId } from '@/entities/workspace';
import { useCreateItem } from '@/features/createItem';
import { useSelectedDate } from '@/features/day/selectDate';
import { useDeleteTask } from '@/features/task/deleteTask';
import { useDuplicateTask } from '@/features/task/duplicateTask';
import { useEditTask } from '@/features/task/editTask';
import type { TaskDates } from '@/features/task/editTask';
import { usePostponeTask } from '@/features/task/postponeTask';
import { isMovableTask, useRescheduleTask } from '@/features/task/rescheduleTask';
import { useToggleTask } from '@/features/task/toggleTask';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
import { ROUTE_PATHS } from '@/shared/config/routePaths';
   import { useHashPath } from '@/shared/lib/hooks/useHashPath';
   import { useToast } from '@/shared/ui/Toast';
import type { TaskPriorityChoice, TaskScreenTab } from '../constants/taskScreen';

export type TaskScreenSheet = 'status' | 'dates' | 'priority' | 'workspace' | 'menu' | 'ai';
export type TaskMenuView = 'menu' | 'delete';

export function useTaskScreen(taskId: string) {
  const { data: tasks } = useGetTasksQuery();
  const { data: categories } = useGetCategoriesQuery();
  const { data: projects } = useGetProjectsQuery();
  const { selectedDate } = useSelectedDate();
  const [, navigate] = useHashPath();
  const { open: openEditor } = useCreateItem();
  const { setTasksDone } = useToggleTask();
  const { postponeTask, restoreTask } = usePostponeTask();
  const { deleteTask, undoDelete } = useDeleteTask();
  const { duplicateTask, undoDuplicate } = useDuplicateTask();
  const { moveToTomorrow, undoMove } = useRescheduleTask();
  const { saveTitle, saveDescription, savePriority, saveDates, saveWorkspace } =
    useEditTask(taskId);
  const { workspaces } = useActiveWorkspace();
  const { showToast } = useToast();

  const [tab, setTab] = useState<TaskScreenTab>('details');
  const [sheet, setSheet] = useState<TaskScreenSheet | null>(null);
   const [menuView, setMenuView] = useState<TaskMenuView>('menu');
   const pendingStatusRef = useRef<TaskDetailsStatus | null>(null);

   const task = useMemo(
    () => tasks?.find((item) => item.id === taskId) ?? null,
    [tasks, taskId],
  );
  const category = task ? categories?.find((item) => item.id === task.categoryId) : undefined;
  const project = task?.projectId
    ? projects?.find((item) => item.id === task.projectId)
    : undefined;
  const workspace = task
    ? workspaces.find((item) => item.id === resolveWorkspaceId(task.workspaceId))
    : undefined;
  const details = useMemo(
    () => (task ? buildTaskDetails(task, selectedDate) : null),
    [task, selectedDate],
  );

   const openSheet = useCallback((next: TaskScreenSheet) => {
     if (next === 'status') pendingStatusRef.current = null;
     setMenuView('menu');
     setSheet(next);
   }, []);

  const closeSheet = useCallback(() => setSheet(null), []);

  const goBack = useCallback(() => {
    navigate(ROUTE_PATHS.today);
  }, [navigate]);

   const changeStatus = useCallback((next: TaskDetailsStatus) => {
     pendingStatusRef.current = next;
     setSheet(null);
   }, []);

   const applyPendingStatus = useCallback(() => {
     const next = pendingStatusRef.current;
     pendingStatusRef.current = null;
     if (!next || !task) return;
     const current = buildTaskDetails(task, selectedDate).status;
     if (next === current) return;

     if (next === 'postponed') postponeTask(task);
     else if (next === 'done') setTasksDone([task], selectedDate, true);
     else if (current === 'postponed') restoreTask(task, task.date);
     else setTasksDone([task], selectedDate, false);
   }, [postponeTask, restoreTask, selectedDate, setTasksDone, task]);

  const changePriority = useCallback(
    (value: TaskPriorityChoice) => {
      setSheet(null);
      savePriority(value === 'none' ? undefined : value);
    },
    [savePriority],
  );

  const changeDates = useCallback(
    (dates: TaskDates) => {
      setSheet(null);
      saveDates(dates);
    },
    [saveDates],
  );

  const changeWorkspace = useCallback(
    (id: string) => {
      setSheet(null);
      const keepProject = project !== undefined && resolveWorkspaceId(project.workspaceId) === id;
      saveWorkspace(id, keepProject ? (task?.projectId ?? null) : null);
    },
    [project, saveWorkspace, task],
  );

  const handleEdit = useCallback(() => {
    if (!task) return;
    setSheet(null);
    openEditor({ kind: 'task', task });
  }, [openEditor, task]);

    const handleDuplicate = useCallback(() => {
    if (!task) return;
    setSheet(null);
    void duplicateTask(task).then((copy) => {
      if (!copy) {
        showToast({ message: 'Не вдалося створити копію' });
        return;
      }
      showToast({
        message: 'Завдання продубльовано',
        actionLabel: 'Відмінити',
        onAction: () => undoDuplicate(copy.id),
      });
    });
  }, [duplicateTask, showToast, task, undoDuplicate]);

  const handleMoveTomorrow = useCallback(() => {
    if (!task) return;
    setSheet(null);
    moveToTomorrow([task], selectedDate);
    showToast({
      message: 'Перенесено на завтра',
      actionLabel: 'Відмінити',
      onAction: () => undoMove([task]),
    });
  }, [moveToTomorrow, selectedDate, showToast, task, undoMove]);

  const handleDelete = useCallback(() => {
    if (!task) return;
    const { id } = task;
    setSheet(null);
    navigate(ROUTE_PATHS.today);
    void deleteTask(id).then((snapshot) => {
      if (!snapshot) {
        showToast({ message: 'Не вдалося видалити завдання' });
        return;
      }
      showToast({
        message: 'Завдання видалено',
        actionLabel: 'Відмінити',
        onAction: () => undoDelete(snapshot),
      });
    });
  }, [deleteTask, navigate, showToast, task, undoDelete]);

  return {
    task,
    isNotFound: tasks !== undefined && task === null,
    category,
    project,
    workspace,
    workspaces,
    details,
    dateKey: selectedDate,
    isRecurring: task ? isRecurringTask(task) : false,
    isMovable: task ? isMovableTask(task) : false,
    tab,
    setTab,
    sheet,
    openSheet,
    closeSheet,
    menuView,
    setMenuView,
    goBack,
    saveTitle,
    saveDescription,
   changeStatus,
   applyPendingStatus,
   changePriority,
   changeDates,
   changeWorkspace,
   handleEdit,
   handleDuplicate,
   handleMoveTomorrow,
   handleDelete,
   };
}