import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { isRecurringTask, isTaskDoneOn, useGetTasksQuery } from '@/entities/task';
import { useTaskClipboard } from '@/features/task/clipboardTasks';
import { useDeleteTask } from '@/features/task/deleteTask';
import { usePostponeTask } from '@/features/task/postponeTask';
import { isMovableTask, useRescheduleTask } from '@/features/task/rescheduleTask';
import { useToggleTask } from '@/features/task/toggleTask';
import { useToast } from '@/shared/ui/Toast';
import {
  getTaskSelection,
  setTaskSelection,
  subscribeTaskSelection,
} from '../lib/taskSelectionStore';

export type SelectionSheetView = 'menu' | 'delete';

interface UseTaskSelectionParams {
  dateKey: string;
}

export function useTaskSelection({ dateKey }: UseTaskSelectionParams) {
  const { data: allTasks } = useGetTasksQuery();
  const { setTasksDone } = useToggleTask();
  const { postponeTask, restoreTask, skipOccurrence, restoreSkipped } = usePostponeTask();
  const { moveToTomorrow, undoMove } = useRescheduleTask();
  const { deleteTasks, undoDeleteMany } = useDeleteTask();
  const { copyTasks, cutTasks } = useTaskClipboard();
  const { showToast } = useToast();

  const selectedIds = useSyncExternalStore(subscribeTaskSelection, getTaskSelection);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetView, setSheetView] = useState<SelectionSheetView>('menu');

  const selectedTasks = useMemo(
    () => (selectedIds ? (allTasks ?? []).filter((task) => selectedIds.has(task.id)) : []),
    [selectedIds, allTasks],
  );
  const pendingTasks = useMemo(
    () => selectedTasks.filter((task) => !isTaskDoneOn(task, dateKey)),
    [dateKey, selectedTasks],
  );
  const movableTasks = useMemo(() => selectedTasks.filter(isMovableTask), [selectedTasks]);

  const start = useCallback((ids: readonly string[]) => {
    setTaskSelection(new Set(ids));
  }, []);

  const cancel = useCallback(() => {
    setTaskSelection(null);
    setIsSheetOpen(false);
  }, []);

  const toggle = useCallback((id: string) => {
    const current = getTaskSelection();
    if (!current) return;
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setTaskSelection(next);
  }, []);

  const isSelected = useCallback((id: string) => selectedIds?.has(id) ?? false, [selectedIds]);

  const handleComplete = useCallback(() => {
    const targets = pendingTasks;
    cancel();
    if (targets.length === 0) return;
    setTasksDone(targets, dateKey, true);
    showToast({
      message: `Виконано: ${targets.length}`,
      actionLabel: 'Відмінити',
      onAction: () => setTasksDone(targets, dateKey, false),
    });
  }, [cancel, dateKey, pendingTasks, setTasksDone, showToast]);

  const handlePostpone = useCallback(() => {
    const targets = pendingTasks;
    cancel();
    if (targets.length === 0) return;
    targets.forEach((task) => {
      if (isRecurringTask(task)) skipOccurrence(task, dateKey);
      else postponeTask(task);
    });
    showToast({
      message: `Відкладено: ${targets.length}`,
      actionLabel: 'Відмінити',
      onAction: () =>
        targets.forEach((task) => {
          if (isRecurringTask(task)) restoreSkipped(task);
          else restoreTask(task, task.date);
        }),
    });
  }, [cancel, dateKey, pendingTasks, postponeTask, restoreSkipped, restoreTask, showToast, skipOccurrence]);

  const handleMoveTomorrow = useCallback(() => {
    const targets = movableTasks;
    cancel();
    if (targets.length === 0) return;
    moveToTomorrow(targets, dateKey);
    showToast({
      message: `Перенесено на завтра: ${targets.length}`,
      actionLabel: 'Відмінити',
      onAction: () => undoMove(targets),
    });
  }, [cancel, dateKey, movableTasks, moveToTomorrow, showToast, undoMove]);

  const openMenu = useCallback(() => {
    setSheetView('menu');
    setIsSheetOpen(true);
  }, []);
  const closeSheet = useCallback(() => setIsSheetOpen(false), []);

  const handleCopy = useCallback(() => {
    const targets = selectedTasks;
    cancel();
    if (targets.length === 0) return;
    copyTasks(targets);
    showToast({ message: `Скопійовано: ${targets.length}` });
  }, [cancel, copyTasks, selectedTasks, showToast]);

  const handleCut = useCallback(() => {
    const targets = selectedTasks;
    cancel();
    if (targets.length === 0) return;
    cutTasks(targets);
    showToast({ message: `Вирізано: ${targets.length}` });
  }, [cancel, cutTasks, selectedTasks, showToast]);

  const handleDelete = useCallback(() => {
    const ids = selectedTasks.map((task) => task.id);
    cancel();
    if (ids.length === 0) return;
    void deleteTasks(ids).then((snapshots) => {
      if (snapshots.length === 0) {
        showToast({ message: 'Не вдалося видалити завдання' });
        return;
      }
      showToast({
        message: `Видалено: ${snapshots.length}`,
        actionLabel: 'Відмінити',
        onAction: () => void undoDeleteMany(snapshots),
      });
    });
  }, [cancel, deleteTasks, selectedTasks, showToast, undoDeleteMany]);

  return {
    isActive: selectedIds !== null,
    isSelected,
    start,
    toggle,
    bar: {
      isActive: selectedIds !== null,
      count: selectedTasks.length,
      canComplete: pendingTasks.length > 0,
      canPostpone: pendingTasks.length > 0,
      canMove: movableTasks.length > 0,
      hasSelection: selectedTasks.length > 0,
      isSheetOpen,
      sheetView,
      onCancel: cancel,
      onComplete: handleComplete,
      onPostpone: handlePostpone,
      onMoveTomorrow: handleMoveTomorrow,
      onOpenMenu: openMenu,
      onCloseSheet: closeSheet,
      onViewChange: setSheetView,
      onCopy: handleCopy,
      onCut: handleCut,
      onConfirmDelete: handleDelete,
    },
  };
}