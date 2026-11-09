import { useCallback, useMemo, useState } from 'react';
import { useGetCategoriesQuery } from '@/entities/category';
import { getSubtaskBounds, resolveSubtaskTask } from '@/entities/task';
import type { Task, TaskDetailsStatus, TaskPriority } from '@/entities/task';
import type { TaskDates } from '@/features/task/editTask';
import type { SubtaskPatch } from '@/features/task/subtasks';
import { useToast } from '@/shared/ui/Toast';
import type { TaskScreenTab } from '../constants/taskScreen';
import type { DatesBounds } from '../types/datesBounds';
import type { TaskMenuView } from './useTaskScreen';

export type SubtaskScreenSheet = 'status' | 'dates' | 'priority' | 'menu' | 'ai';

interface SubtaskScreenActions {
  onChange: (id: string, patch: SubtaskPatch) => void;
  onDuplicate: (id: string) => boolean;
  onDelete: (id: string) => void;
  onRestore: (snapshot: Task['subtasks']) => void;
  onClose: () => void;
}

export function useSubtaskScreen(
  root: Task,
  subtaskId: string,
  { onChange, onDuplicate, onDelete, onRestore, onClose }: SubtaskScreenActions,
) {
  const { data: categories } = useGetCategoriesQuery();
  const { showToast } = useToast();
  const [tab, setTab] = useState<TaskScreenTab>('details');
  const [sheet, setSheet] = useState<SubtaskScreenSheet | null>(null);
  const [menuView, setMenuView] = useState<TaskMenuView>('menu');

  const resolved = useMemo(() => resolveSubtaskTask(root, subtaskId), [root, subtaskId]);
  const task = resolved?.task ?? null;
  const parent = resolved?.parent ?? null;
  const bounds = useMemo<DatesBounds>(() => (parent ? getSubtaskBounds(parent) : {}), [parent]);
  const category = task ? categories?.find((item) => item.id === task.categoryId) : undefined;
  const status: TaskDetailsStatus = task?.status === 'done' ? 'done' : 'active';

  const patch = useCallback((next: SubtaskPatch) => onChange(subtaskId, next), [onChange, subtaskId]);

  const openSheet = useCallback((next: SubtaskScreenSheet) => {
    setMenuView('menu');
    setSheet(next);
  }, []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const saveTitle = useCallback((title: string) => patch({ title }), [patch]);
  const saveDescription = useCallback((description: string) => patch({ description }), [patch]);

  const changeStatus = useCallback(
    (next: TaskDetailsStatus) => {
      setSheet(null);
      patch({ done: next === 'done' });
    },
    [patch],
  );

  const changePriority = useCallback(
    (priority: TaskPriority | undefined) => {
      setSheet(null);
      patch({ priority });
    },
    [patch],
  );

  const changeDates = useCallback(
    (dates: TaskDates) => {
      setSheet(null);
      patch({
        date: dates.date,
        endDate: dates.endDate ?? null,
        startTime: dates.startTime,
        endTime: dates.endTime,
      });
    },
    [patch],
  );

  const handleDuplicate = useCallback(() => {
    const snapshot = root.subtasks;
    setSheet(null);
    if (!onDuplicate(subtaskId)) {
      showToast({ message: 'Не вдалося створити копію' });
      return;
    }
    showToast({
      message: 'Підзавдання продубльовано',
      actionLabel: 'Відмінити',
      onAction: () => onRestore(snapshot),
    });
  }, [onDuplicate, onRestore, root.subtasks, showToast, subtaskId]);

  const handleDelete = useCallback(() => {
    const snapshot = root.subtasks;
    setSheet(null);
    onDelete(subtaskId);
    onClose();
    showToast({
      message: 'Підзавдання видалено',
      actionLabel: 'Відмінити',
      onAction: () => onRestore(snapshot),
    });
  }, [onClose, onDelete, onRestore, root.subtasks, showToast, subtaskId]);

  const applyAiUpdate = useCallback(
    (update: SubtaskPatch) => {
      const snapshot = root.subtasks;
      patch(update);
      showToast({
        message: 'Підзавдання оновлено',
        actionLabel: 'Відмінити',
        onAction: () => onRestore(snapshot),
      });
    },
    [onRestore, patch, root.subtasks, showToast],
  );

  return {
    task,
    parent,
    category,
    bounds,
    status,
    tab,
    setTab,
    sheet,
    openSheet,
    closeSheet,
    patch,
    saveTitle,
    saveDescription,
    changeStatus,
    changePriority,
    changeDates,
    menuView,
    setMenuView,
    handleDuplicate,
    handleDelete,
    applyAiUpdate,
  };
}