import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_CATEGORY_ID } from '@/entities/category';
import type { Category, CategoryId } from '@/entities/category';
import type { Task } from '@/entities/task';
import { useCategoryClipboard } from '@/features/category/clipboardCategories';
import { useDeleteCategory } from '@/features/category/deleteCategory';
import { useEditCategoryAppearance } from '@/features/category/editCategoryAppearance';
import type { CategoryAppearance } from '@/features/category/editCategoryAppearance';
import { useRenameCategory } from '@/features/category/renameCategory';
import { useCreateItem } from '@/features/createItem';
import { useTaskClipboard } from '@/features/task/clipboardTasks';
import { isMovableTask, useRescheduleTask } from '@/features/task/rescheduleTask';
import { useToast } from '@/shared/ui/Toast';

export type CategorySheetView = 'menu' | 'rename' | 'appearance' | 'delete';

interface UseCategoryActionsParams {
  getCategoryTasks: (id: CategoryId) => readonly Task[];
  dateKey: string;
  workspaceId: string;
  onStartSelection: (id: CategoryId) => void;
}

export function useCategoryActions({
  getCategoryTasks,
  dateKey,
  workspaceId,
  onStartSelection,
}: UseCategoryActionsParams) {
  const { renameCategory } = useRenameCategory();
  const { updateAppearance } = useEditCategoryAppearance();
  const { deleteCategory, undoDelete } = useDeleteCategory();
  const { moveToTomorrow, undoMove } = useRescheduleTask();
    const { open } = useCreateItem();
  const { clipboardCount, pasteTasks } = useTaskClipboard();
  const {
    clipboardCount: categoryClipboardCount,
    canPasteInto,
    copyCategories,
    cutCategories,
    pasteCategoriesWithToast,
    pasteCategoryTasksWithToast,
  } = useCategoryClipboard();
  const { showToast } = useToast();

  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<CategorySheetView>('menu');
  const [isPasteChoiceOpen, setIsPasteChoiceOpen] = useState(false);

  const categoryTasks = useMemo(
    () => (activeCategory ? getCategoryTasks(activeCategory.id) : []),
    [activeCategory, getCategoryTasks],
  );
  const movableTasks = useMemo(() => categoryTasks.filter(isMovableTask), [categoryTasks]);

  const openCategoryActions = useCallback((category: Category) => {
    setActiveCategory(category);
    setView('menu');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsPasteChoiceOpen(false);
  }, []);

  const openPasteChoice = useCallback(() => setIsPasteChoiceOpen(true), []);
  const closePasteChoice = useCallback(() => setIsPasteChoiceOpen(false), []);

  const handleAddTask = useCallback(() => {
    if (!activeCategory) return;
    setIsOpen(false);
    open({ kind: 'task', categoryId: activeCategory.id });
  }, [activeCategory, open]);

  const handleSelect = useCallback(() => {
    if (!activeCategory) return;
    setIsOpen(false);
    onStartSelection(activeCategory.id);
  }, [activeCategory, onStartSelection]);

  const handleCopy = useCallback(() => {
    if (!activeCategory) return;
    setIsOpen(false);
    copyCategories([activeCategory], workspaceId);
    showToast({ message: 'Категорію скопійовано' });
  }, [activeCategory, copyCategories, showToast, workspaceId]);

  const handleCut = useCallback(() => {
    if (!activeCategory || activeCategory.id === DEFAULT_CATEGORY_ID) return;
    setIsOpen(false);
    cutCategories([activeCategory], workspaceId);
    showToast({ message: 'Категорію вирізано' });
  }, [activeCategory, cutCategories, showToast, workspaceId]);

  const handleRename = useCallback(
    (title: string) => {
      if (!activeCategory) return;
      renameCategory(activeCategory.id, title);
      setIsOpen(false);
    },
    [activeCategory, renameCategory],
  );

  const handleAppearance = useCallback(
    (appearance: CategoryAppearance) => {
      if (!activeCategory) return;
      updateAppearance(activeCategory.id, appearance);
      setIsOpen(false);
    },
    [activeCategory, updateAppearance],
  );

  const handleMoveTomorrow = useCallback(() => {
    const tasks = movableTasks;
    setIsOpen(false);
    if (tasks.length === 0) return;
    moveToTomorrow(tasks, dateKey);
    showToast({
      message: `Перенесено на завтра: ${tasks.length}`,
      actionLabel: 'Відмінити',
      onAction: () => undoMove(tasks),
    });
  }, [dateKey, movableTasks, moveToTomorrow, showToast, undoMove]);

  const handlePaste = useCallback(() => {
    if (!activeCategory) return;
    const { id } = activeCategory;
    setIsOpen(false);
    void pasteTasks(id, workspaceId).then((result) => {
      if (!result) {
        showToast({ message: 'Немає що вставляти' });
        return;
      }
      showToast({
        message: `${result.mode === 'cut' ? 'Переміщено' : 'Вставлено'}: ${result.count}`,
        actionLabel: 'Відмінити',
        onAction: result.undo,
      });
    });
  }, [activeCategory, pasteTasks, showToast, workspaceId]);

  const handlePasteAsCategory = useCallback(() => {
    setIsOpen(false);
    setIsPasteChoiceOpen(false);
    pasteCategoriesWithToast(workspaceId);
  }, [pasteCategoriesWithToast, workspaceId]);

  const handlePasteCategoryTasks = useCallback(() => {
    if (!activeCategory) return;
    setIsOpen(false);
    setIsPasteChoiceOpen(false);
    pasteCategoryTasksWithToast(activeCategory.id, workspaceId);
  }, [activeCategory, pasteCategoryTasksWithToast, workspaceId]);

    const handleDelete = useCallback(() => {
    if (!activeCategory) return;
    const { id } = activeCategory;
    setIsOpen(false);
    void deleteCategory(id).then((snapshot) => {
      if (!snapshot) {
        showToast({ message: 'Не вдалося видалити категорію' });
        return;
      }
      showToast({
        message: 'Категорію видалено',
        actionLabel: 'Відмінити',
        onAction: () => undoDelete(snapshot),
      });
    });
  }, [activeCategory, deleteCategory, showToast, undoDelete]);

  return {
    openCategoryActions,
    categoryActions: {
      category: activeCategory,
      tasksCount: categoryTasks.length,
      movableCount: movableTasks.length,
      pasteCount: clipboardCount,
      pasteCategoriesCount: categoryClipboardCount,
      canPasteAsCategory: canPasteInto(workspaceId),
      isPasteChoiceOpen,
      onOpenPasteChoice: openPasteChoice,
      onClosePasteChoice: closePasteChoice,
      canDelete: activeCategory !== null && activeCategory.id !== DEFAULT_CATEGORY_ID,
      canCut: activeCategory !== null && activeCategory.id !== DEFAULT_CATEGORY_ID,
      isOpen,
      view,
      onClose: close,
      onViewChange: setView,
      onAddTask: handleAddTask,
      onSelect: handleSelect,
      onCopy: handleCopy,
      onCut: handleCut,
      onRename: handleRename,
      onAppearance: handleAppearance,
      onMoveTomorrow: handleMoveTomorrow,
      onPaste: handlePaste,
      onPasteAsCategory: handlePasteAsCategory,
      onPasteCategoryTasks: handlePasteCategoryTasks,
      onDelete: handleDelete,
    },
  };
}