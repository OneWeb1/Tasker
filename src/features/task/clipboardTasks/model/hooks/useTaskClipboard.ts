import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  buildTaskCopy,
  useCreateTasksMutation,
  useGetTasksQuery,
  useRemoveTasksMutation,
  useUpdateTaskMutation,
} from '@/entities/task';
import type { Task } from '@/entities/task';
import { resolveWorkspaceId } from '@/entities/workspace';
import { getTaskClipboard, setTaskClipboard, subscribeTaskClipboard } from '../lib/taskClipboardStore';
import type { TaskClipboardMode } from '../lib/taskClipboardStore';

export interface PasteResult {
  mode: TaskClipboardMode;
  count: number;
  undo: () => void;
}

export function useTaskClipboard() {
  const { data: tasks } = useGetTasksQuery();
  const [createTasks] = useCreateTasksMutation();
  const [removeTasks] = useRemoveTasksMutation();
  const [updateTask] = useUpdateTaskMutation();
  const clipboard = useSyncExternalStore(subscribeTaskClipboard, getTaskClipboard);

  const sources = useMemo<Task[]>(() => {
    if (!clipboard) return [];
    const ids = new Set(clipboard.ids);
    return (tasks ?? []).filter((task) => ids.has(task.id));
  }, [clipboard, tasks]);

  const copyTasks = useCallback((selected: readonly Task[]) => {
    setTaskClipboard({ mode: 'copy', ids: selected.map((task) => task.id) });
  }, []);

  const cutTasks = useCallback((selected: readonly Task[]) => {
    setTaskClipboard({ mode: 'cut', ids: selected.map((task) => task.id) });
  }, []);

  const pasteTasks = useCallback(
    async (categoryId: string, workspaceId: string): Promise<PasteResult | null> => {
      if (!clipboard || sources.length === 0) return null;

      const isSameWorkspace = (task: Task): boolean =>
        resolveWorkspaceId(task.workspaceId) === workspaceId;

      if (clipboard.mode === 'copy') {
        const bodies = sources.map((task) =>
          buildTaskCopy(task, {
            categoryId,
            workspaceId,
            projectId: isSameWorkspace(task) ? task.projectId : null,
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

      const movable = sources.filter(
        (task) => task.categoryId !== categoryId || !isSameWorkspace(task),
      );
      const results = await Promise.all(
        movable.map((task) =>
          updateTask({
            id: task.id,
            patch: {
              categoryId,
              workspaceId,
              ...(isSameWorkspace(task) ? {} : { projectId: null }),
            },
          })
            .unwrap()
            .then(
              () => task,
              () => null,
            ),
        ),
      );
      const moved = results.filter((task): task is Task => task !== null);
      setTaskClipboard(null);
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
                projectId: task.projectId,
                workspaceId: resolveWorkspaceId(task.workspaceId),
              },
            });
          });
        },
      };
    },
    [clipboard, createTasks, removeTasks, sources, updateTask],

  );

  return {
    clipboardCount: sources.length,
    copyTasks,
    cutTasks,
    pasteTasks,
  };
}