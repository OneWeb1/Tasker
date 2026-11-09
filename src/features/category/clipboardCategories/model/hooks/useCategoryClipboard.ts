import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  DEFAULT_CATEGORY_ID,
  filterCategoriesByWorkspace,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from '@/entities/category';
import type { Category } from '@/entities/category';
import {
  buildTaskCopy,
  useCreateTasksMutation,
  useGetTasksQuery,
  useRemoveTasksMutation,
  useUpdateTaskMutation,
} from '@/entities/task';
import type { Task } from '@/entities/task';
import { useToast } from '@/shared/ui/Toast';
import { buildCategoryCopyTitle } from '../lib/buildCategoryCopyTitle';
import {
  getCategoryClipboard,
  setCategoryClipboard,
  subscribeCategoryClipboard,
} from '../lib/categoryClipboardStore';
import type { CategoryClipboardMode } from '../lib/categoryClipboardStore';
import { collectCategoryTasks } from '../lib/collectCategoryTasks';

export interface CategoryPasteResult {
  mode: CategoryClipboardMode;
  count: number;
  undo: () => void;
}

interface MovedCategory {
  category: Category;
  tasks: Task[];
}

export function useCategoryClipboard() {
  const { data: allCategories } = useGetCategoriesQuery();
  const { data: allTasks } = useGetTasksQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [createTasks] = useCreateTasksMutation();
  const [removeTasks] = useRemoveTasksMutation();
  const [updateTask] = useUpdateTaskMutation();
  const clipboard = useSyncExternalStore(subscribeCategoryClipboard, getCategoryClipboard);
  const { showToast } = useToast();

  const sources = useMemo<Category[]>(() => {
    if (!clipboard) return [];
    const ids = new Set(clipboard.ids);
    return (allCategories ?? []).filter((category) => ids.has(category.id));
  }, [allCategories, clipboard]);

  const copyCategories = useCallback((selected: readonly Category[], workspaceId: string) => {
    setCategoryClipboard({ mode: 'copy', ids: selected.map((category) => category.id), workspaceId });
  }, []);

  const cutCategories = useCallback((selected: readonly Category[], workspaceId: string) => {
    setCategoryClipboard({ mode: 'cut', ids: selected.map((category) => category.id), workspaceId });
  }, []);

  const removeCopies = useCallback(
    async (categories: readonly Category[], tasks: readonly Task[]): Promise<void> => {
      if (tasks.length > 0) await removeTasks(tasks.map((task) => task.id));
      for (const category of categories) await deleteCategory(category.id);
    },
    [deleteCategory, removeTasks],
  );

  const restoreMoved = useCallback(
    async (moved: readonly MovedCategory[], workspaceId: string): Promise<void> => {
      for (const { category, tasks } of moved) {
        await updateCategory({ id: category.id, patch: { workspaceId } });
        await Promise.all(
          tasks.map((task) =>
            updateTask({ id: task.id, patch: { workspaceId, projectId: task.projectId } }),
          ),
        );
      }
    },
    [updateCategory, updateTask],
  );

  const copyInto = useCallback(
    async (workspaceId: string): Promise<CategoryPasteResult | null> => {
      if (!clipboard) return null;

      const sourceWorkspaceId = clipboard.workspaceId;
      const isSameWorkspace = sourceWorkspaceId === workspaceId;
      const tasks = allTasks ?? [];
      const titles = filterCategoriesByWorkspace(allCategories ?? [], workspaceId).map(
        (category) => category.title,
      );
      const createdCategories: Category[] = [];
      const createdTasks: Task[] = [];

      try {
        for (const source of sources) {
          const category = await createCategory({
            title: buildCategoryCopyTitle(source.title, titles),
            emoji: source.emoji,
            color: source.color,
            workspaceId,
          }).unwrap();
          createdCategories.push(category);
          titles.push(category.title);

          const bodies = collectCategoryTasks(tasks, source.id, sourceWorkspaceId).map((task) =>
            buildTaskCopy(task, {
              categoryId: category.id,
              workspaceId,
              projectId: isSameWorkspace ? task.projectId : null,
            }),
          );
          if (bodies.length > 0) createdTasks.push(...(await createTasks(bodies).unwrap()));
        }
      } catch {
        await removeCopies(createdCategories, createdTasks);
        return null;
      }

      return {
        mode: 'copy',
        count: createdCategories.length,
        undo: () => {
          void removeCopies(createdCategories, createdTasks);
        },
      };
    },
    [allCategories, allTasks, clipboard, createCategory, createTasks, removeCopies, sources],

  );

  const moveInto = useCallback(
    async (workspaceId: string): Promise<CategoryPasteResult | null> => {
      if (!clipboard) return null;

      const sourceWorkspaceId = clipboard.workspaceId;
      if (sourceWorkspaceId === workspaceId) return null;

      const tasks = allTasks ?? [];
      const moved: MovedCategory[] = [];

      for (const category of sources) {
        if (category.id === DEFAULT_CATEGORY_ID) continue;

        const isMoved = await updateCategory({ id: category.id, patch: { workspaceId } })
          .unwrap()
          .then(
            () => true,
            () => false,
          );
        if (!isMoved) continue;

        const results = await Promise.all(
          collectCategoryTasks(tasks, category.id, sourceWorkspaceId).map((task) =>
            updateTask({ id: task.id, patch: { workspaceId, projectId: null } })
              .unwrap()
              .then(
                () => task,
                () => null,
              ),
          ),
        );
        moved.push({ category, tasks: results.filter((task): task is Task => task !== null) });
      }

      setCategoryClipboard(null);
      if (moved.length === 0) return null;

      return {
        mode: 'cut',
        count: moved.length,
        undo: () => {
          void restoreMoved(moved, sourceWorkspaceId);
        },
      };
    },
    [allTasks, clipboard, restoreMoved, sources, updateCategory, updateTask],

  );

  const pasteCategories = useCallback(
    (workspaceId: string): Promise<CategoryPasteResult | null> => {
      if (!clipboard || sources.length === 0) return Promise.resolve(null);
      return clipboard.mode === 'copy' ? copyInto(workspaceId) : moveInto(workspaceId);
    },
    [clipboard, copyInto, moveInto, sources.length],
  );

  const canPasteInto = useCallback(
    (workspaceId: string): boolean =>
      clipboard !== null &&
      sources.length > 0 &&
      (clipboard.mode === 'copy' || clipboard.workspaceId !== workspaceId),
    [clipboard, sources.length],
  );

  const pasteCategoriesWithToast = useCallback(
    (workspaceId: string) => {
      void pasteCategories(workspaceId).then((result) => {
        if (!result) {
          showToast({ message: 'Не вдалося вставити категорії' });
          return;
        }
        showToast({
          message: `${result.mode === 'cut' ? 'Переміщено' : 'Вставлено'} категорій: ${result.count}`,
          actionLabel: 'Відмінити',
          onAction: result.undo,
        });
      });
    },
    [pasteCategories, showToast],
  );

  const pasteCategoryTasks = useCallback(
    async (categoryId: string, workspaceId: string): Promise<CategoryPasteResult | null> => {
      if (!clipboard || sources.length === 0) return null;

      const sourceWorkspaceId = clipboard.workspaceId;
      const isSameWorkspace = sourceWorkspaceId === workspaceId;
      const tasks = sources.flatMap((source) =>
        collectCategoryTasks(allTasks ?? [], source.id, sourceWorkspaceId),
      );

      if (clipboard.mode === 'copy') {
        if (tasks.length === 0) return null;
        const bodies = tasks.map((task) =>
          buildTaskCopy(task, {
            categoryId,
            workspaceId,
            projectId: isSameWorkspace ? task.projectId : null,
          }),
        );
        try {
          const created = await createTasks(bodies).unwrap();
          return {
            mode: 'copy',
            count: created.length,
            undo: () => {
              void removeTasks(created.map((task) => task.id));
            },
          };
        } catch {
          return null;
        }
      }

      const movable = tasks.filter((task) => task.categoryId !== categoryId || !isSameWorkspace);
      const results = await Promise.all(
        movable.map((task) =>
          updateTask({
            id: task.id,
            patch: { categoryId, workspaceId, ...(isSameWorkspace ? {} : { projectId: null }) },
          })
            .unwrap()
            .then(
              () => task,
              () => null,
            ),
        ),
      );
      const moved = results.filter((task): task is Task => task !== null);
      setCategoryClipboard(null);
      if (moved.length === 0) return null;

      return {
        mode: 'cut',
        count: moved.length,
        undo: () => {
          moved.forEach((task) => {
            void updateTask({
              id: task.id,
              patch: {
                categoryId: task.categoryId,
                workspaceId: sourceWorkspaceId,
                projectId: task.projectId,
              },
            });
          });
        },
      };
    },
    [allTasks, clipboard, createTasks, removeTasks, sources, updateTask],

  );

  const pasteCategoryTasksWithToast = useCallback(
    (categoryId: string, workspaceId: string) => {
      void pasteCategoryTasks(categoryId, workspaceId).then((result) => {
        if (!result) {
          showToast({ message: 'Немає завдань для вставки' });
          return;
        }
        showToast({
          message: `${result.mode === 'cut' ? 'Переміщено' : 'Вставлено'} завдань: ${result.count}`,
          actionLabel: 'Відмінити',
          onAction: result.undo,
        });
      });
    },
    [pasteCategoryTasks, showToast],
  );

  return {
    clipboardCount: sources.length,
    copyCategories,
    cutCategories,
    canPasteInto,
    pasteCategoriesWithToast,
    pasteCategoryTasksWithToast,
  };
}