import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { filterCategoriesByWorkspace, useGetCategoriesQuery } from '@/entities/category';
import { useGetProjectsQuery } from '@/entities/project';
import {
  calculateTaskProgress,
  filterByProject,
  filterTasksByDate,
  groupTasksByCategory,
  isRecurringTask,
  isTaskDoneOn,
  useGetTasksQuery,
} from '@/entities/task';
import type { Task } from '@/entities/task';
import { filterByWorkspace } from '@/entities/workspace';
import { useReorderCategories } from '@/features/category/reorderCategories';
import { useCreateItem } from '@/features/createItem';
import { matchesQuery, useDaySearch } from '@/features/day/searchDay';
import { useSelectedDate } from '@/features/day/selectDate';
import { useTaskView } from '@/features/day/switchTab';
import { useActiveProject } from '@/features/project/filterByProject';
import { useDeleteTask } from '@/features/task/deleteTask';
import { useDuplicateTask } from '@/features/task/duplicateTask';
import { usePostponeTask } from '@/features/task/postponeTask';
import { isMovableTask, useRescheduleTask } from '@/features/task/rescheduleTask';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
import { buildTaskPath } from '@/shared/config/routePaths';
import { useHashPath } from '@/shared/lib/hooks/useHashPath';
import { useSortableList } from '@/shared/lib/hooks/useSortableList';
import { readValue, writeValue } from '@/shared/lib/utils/storage';
import { useToast } from '@/shared/ui/Toast';
import { formatSortAnnouncement } from '../lib/formatSortAnnouncement';
import { useCategoryActions } from './useCategoryActions';
import { useCategorySelection } from './useCategorySelection';
import { useTaskSelection } from './useTaskSelection';

export type TaskSheetView = 'menu' | 'delete';

const CLICK_AFTER_DRAG_MS = 300;
const COLLAPSED_CATEGORIES_KEY = 'collapsedCategoriesByScope';
const POSTPONED_SCOPE = 'postponed';

type CollapsedByScope = Readonly<Record<string, readonly string[]>>;

const readCollapsedByScope = (): CollapsedByScope => {
  const stored = readValue<unknown>(COLLAPSED_CATEGORIES_KEY, {});
  if (typeof stored !== 'object' || stored === null || Array.isArray(stored)) return {};

  const result: Record<string, readonly string[]> = {};
  for (const [scope, ids] of Object.entries(stored)) {
    if (!Array.isArray(ids)) continue;
    const valid = ids.filter((id): id is string => typeof id === 'string');
    if (valid.length > 0) result[scope] = valid;
  }
  return result;
};

export function useTaskGroups() {
  const { taskFilter, hideEmptyCategories } = useTaskView();
  const { query } = useDaySearch();
  const { selectedDate: anchorDate } = useSelectedDate();
  const [picked, setPicked] = useState<{ anchor: string; date: string } | null>(null);
  const selectedDate = picked && picked.anchor === anchorDate ? picked.date : anchorDate;
  const pickDate = useCallback(
    (dateKey: string) => setPicked({ anchor: anchorDate, date: dateKey }),
    [anchorDate],
  );
  const { workspace } = useActiveWorkspace();
  const workspaceId = workspace.id;
  const { activeProjectId } = useActiveProject();
  const { data: tasks } = useGetTasksQuery();
  const { data: projects } = useGetProjectsQuery();
  const { data: allCategories } = useGetCategoriesQuery();
  const categories = useMemo(
    () => filterCategoriesByWorkspace(allCategories ?? [], workspaceId),
    [allCategories, workspaceId],
  );
  const [, navigate] = useHashPath();
  const { postponeTask, restoreTask, skipOccurrence, restoreSkipped } = usePostponeTask();
  const { deleteTask, undoDelete } = useDeleteTask();
  const { duplicateTask, undoDuplicate } = useDuplicateTask();
  const { moveToTomorrow, undoMove } = useRescheduleTask();
  const { showToast } = useToast();
const { open } = useCreateItem();
  const { reorderCategories } = useReorderCategories();
  const [collapsedByScope, setCollapsedByScope] =
    useState<CollapsedByScope>(readCollapsedByScope);
  const collapseScope =
    taskFilter === 'postponed'
      ? POSTPONED_SCOPE
      : taskFilter === 'done'
        ? `done:${selectedDate}`
        : selectedDate;
  const collapsedIds = useMemo<ReadonlySet<string>>(
    () => new Set(collapsedByScope[collapseScope] ?? []),
    [collapsedByScope, collapseScope],
  );

  useEffect(() => {
    writeValue(COLLAPSED_CATEGORIES_KEY, collapsedByScope);
  }, [collapsedByScope]);
  const dragEndedAt = useRef(0);

  const categoryIds = useMemo(
    () => (categories ?? []).map((category) => category.id),
    [categories],
  );
  const sortable = useSortableList({
    ids: categoryIds,
    onReorder: reorderCategories,
    isEnabled: !hideEmptyCategories,
  });
  const sortAnnouncement = useMemo(
    () => formatSortAnnouncement(sortable.announcement, categories ?? []),
    [categories, sortable.announcement],
  );

  const { isDragging } = sortable;
  useEffect(() => {
    if (isDragging) dragEndedAt.current = Number.POSITIVE_INFINITY;
    else if (dragEndedAt.current === Number.POSITIVE_INFINITY) {
      dragEndedAt.current = performance.now();
    }
  }, [isDragging]);

  const toggleCategory = useCallback(
    (id: string) => {
      if (isDragging || performance.now() - dragEndedAt.current < CLICK_AFTER_DRAG_MS) return;
      setCollapsedByScope((current) => {
        const ids = current[collapseScope] ?? [];
        const nextIds = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
        const next = { ...current };
        if (nextIds.length > 0) next[collapseScope] = nextIds;
        else delete next[collapseScope];
        return next;
      });
    },
    [collapseScope, isDragging],
  );

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetView, setSheetView] = useState<TaskSheetView>('menu');

  const scopedTasks = useMemo(
    () => filterByProject(filterByWorkspace(tasks ?? [], workspaceId), activeProjectId),
    [activeProjectId, tasks, workspaceId],
  );

  const dayTasks = useMemo(
    () =>
      filterTasksByDate(scopedTasks, selectedDate).filter((task) => task.status !== 'postponed'),
    [scopedTasks, selectedDate],
  );

  const statusTasks = useMemo(() => {
    const postponed = scopedTasks.filter((task) => task.status === 'postponed');
    if (taskFilter === 'postponed') return postponed;
    if (taskFilter === 'all') return [...dayTasks, ...postponed];
    const wantDone = taskFilter === 'done';
    return dayTasks.filter((task) => isTaskDoneOn(task, selectedDate) === wantDone);
  }, [dayTasks, scopedTasks, selectedDate, taskFilter]);

  const listTasks = useMemo(
    () => statusTasks.filter((task) => matchesQuery(query, task.title, task.description)),
    [query, statusTasks],
  );

  const buildGroups = useCallback((list: readonly Task[]) => {
    const projectsById = new Map((projects ?? []).map((project) => [project.id, project] as const));

    return groupTasksByCategory([...list], categories ?? []).map(({ category, tasks: groupTasks }) => ({
      category,
      progress: calculateTaskProgress(groupTasks, selectedDate),
      items: groupTasks.map((task) => ({
        task,
        isDone: isTaskDoneOn(task, selectedDate),
        project: task.projectId ? projectsById.get(task.projectId) : undefined,
      })),
    }));
  }, [categories, projects, selectedDate]);

  const fullGroups = useMemo(() => buildGroups(dayTasks), [buildGroups, dayTasks]);

  const groups = useMemo(() => {
    const dayProgress = new Map(
      fullGroups.map((group) => [group.category.id, group.progress] as const),
    );
    return buildGroups(listTasks).map((group) => ({
      ...group,
      progress: dayProgress.get(group.category.id) ?? group.progress,
    }));
  }, [buildGroups, fullGroups, listTasks]);

  const visibleGroups = useMemo(
    () => (hideEmptyCategories ? groups.filter((group) => group.items.length > 0) : groups),
    [groups, hideEmptyCategories],
  );

  const isEmpty = groups.every((group) => group.items.length === 0);

  const getCategoryTasks = useCallback(
    (id: string) =>
      groups.find((group) => group.category.id === id)?.items.map((item) => item.task) ?? [],
    [groups],
  );
  const selection = useTaskSelection({ dateKey: selectedDate });
  const categorySelection = useCategorySelection({ categories, workspaceId });
  const cancelTaskSelection = selection.bar.onCancel;
  const startCategorySelection = categorySelection.start;
  const handleStartCategorySelection = useCallback(
    (id: string) => {
      cancelTaskSelection();
      startCategorySelection(id);
    },
    [cancelTaskSelection, startCategorySelection],
  );

  const { openCategoryActions, categoryActions } = useCategoryActions({
    getCategoryTasks,
    dateKey: selectedDate,
    workspaceId,
    onStartSelection: handleStartCategorySelection,
  });

  const openTaskActions = useCallback((task: Task) => {
    setActiveTask(task);
    setSheetView('menu');
    setIsSheetOpen(true);
  }, []);

  const openTask = useCallback(
    (task: Task) => {
      navigate(buildTaskPath(task.id));
    },
    [navigate],
  );

  const closeTaskActions = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  const handlePostpone = useCallback(() => {
    if (!activeTask) return;
    const task = activeTask;
    setIsSheetOpen(false);

    if (isRecurringTask(task)) {
      skipOccurrence(task, selectedDate);
      showToast({
        message: 'Пропущено на цей день',
        actionLabel: 'Відмінити',
        onAction: () => restoreSkipped(task),
      });
      return;
    }

    postponeTask(task);
    showToast({
      message: 'Завдання відкладено',
      actionLabel: 'Відмінити',
      onAction: () => restoreTask(task, task.date),
    });

  }, [
    activeTask,
    postponeTask,
    restoreSkipped,
    restoreTask,
    selectedDate,
    showToast,
    skipOccurrence,
  ]);

  const handleRestore = useCallback(() => {
    if (!activeTask) return;
    restoreTask(activeTask, selectedDate);
    setIsSheetOpen(false);
    showToast({ message: 'Завдання повернено' });
  }, [activeTask, restoreTask, selectedDate, showToast]);

  const handleEdit = useCallback(() => {
    if (!activeTask) return;
    setIsSheetOpen(false);
    open({ kind: 'task', task: activeTask });
  }, [activeTask, open]);

  const handleDelete = useCallback(() => {
    if (!activeTask) return;
    const { id } = activeTask;
    setIsSheetOpen(false);
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
  }, [activeTask, deleteTask, showToast, undoDelete]);

  const handleDuplicate = useCallback(() => {
    if (!activeTask) return;
    setIsSheetOpen(false);
    void duplicateTask(activeTask).then((copy) => {
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
  }, [activeTask, duplicateTask, showToast, undoDuplicate]);

  const handleMoveTomorrow = useCallback(() => {
    if (!activeTask) return;
    const task = activeTask;
    setIsSheetOpen(false);
    moveToTomorrow([task], selectedDate);
    showToast({
      message: 'Перенесено на завтра',
      actionLabel: 'Відмінити',
      onAction: () => undoMove([task]),
    });
  }, [activeTask, moveToTomorrow, selectedDate, showToast, undoMove]);

  const startSelection = selection.start;
  const cancelCategorySelection = categorySelection.cancel;
  const handleSelect = useCallback(() => {
    if (!activeTask) return;
    setIsSheetOpen(false);
    cancelCategorySelection();
    startSelection([activeTask.id]);
  }, [activeTask, cancelCategorySelection, startSelection]);

  const activeTaskCategory = activeTask
    ? (categories ?? []).find((category) => category.id === activeTask.categoryId)
    : undefined;

  const taskSheet = {
    task: activeTask,
    view: sheetView,
    isRecurring: activeTask ? isRecurringTask(activeTask) : false,
    isDone: activeTask ? isTaskDoneOn(activeTask, selectedDate) : false,
    onClose: closeTaskActions,
    onViewChange: setSheetView,
    onPostpone: handlePostpone,
    onRestore: handleRestore,
    onEdit: handleEdit,
    onDelete: handleDelete,
  };

  return {
    groups: visibleGroups,
    summaryGroups: fullGroups,
    viewDate: selectedDate,
    taskFilter,
    hideEmptyCategories,
    pickDate,
    isEmpty,
    sortable,
    sortAnnouncement,
    collapsedIds,
    toggleCategory,
    openTaskActions,
    openTask,
    openCategoryActions,
    categoryActions,
    selection,
    categorySelection,
    taskActions: {
      ...taskSheet,
      category: activeTaskCategory,
      isMovable: activeTask ? isMovableTask(activeTask) : false,
      onDuplicate: handleDuplicate,
      onMoveTomorrow: handleMoveTomorrow,
      onSelect: handleSelect,
      isOpen: isSheetOpen,
    },
  };
}