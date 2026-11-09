import { useCallback } from 'react';
import {
  appendStatusChange,
  isRecurringTask,
  isTaskDoneOn,
  pauseTaskTimer,
  useUpdateTaskMutation,
} from '@/entities/task';
import type { NewTask, Task } from '@/entities/task';

const getTimerPausePatch = (task: Task, isBecomingDone: boolean): Partial<NewTask> => {
  const timer = isBecomingDone ? pauseTaskTimer(task, Date.now()) : null;
  return timer ? { timer } : {};
};

const getStatusPatch = (task: Task, isBecomingDone: boolean): Partial<NewTask> =>
  appendStatusChange(task, isBecomingDone ? 'done' : 'active', Date.now());

export function useToggleTask() {
  const [updateTask] = useUpdateTaskMutation();

  const toggleTask = useCallback(
    (task: Task, dateKey: string) => {
      const isDone = isTaskDoneOn(task, dateKey);

      if (isRecurringTask(task)) {
        const dates = task.completedDates ?? [];
        void updateTask({
          id: task.id,
          patch: {
            completedDates: isDone ? dates.filter((date) => date !== dateKey) : [...dates, dateKey],
            ...getTimerPausePatch(task, !isDone),
            ...getStatusPatch(task, !isDone),
          },
        });
        return;
      }

      void updateTask({
        id: task.id,
        patch: {
          status: isDone ? 'active' : 'done',
          ...getTimerPausePatch(task, !isDone),
          ...getStatusPatch(task, !isDone),
        },
      });
    },
    [updateTask],
  );

  const setTasksDone = useCallback(
    (tasks: readonly Task[], dateKey: string, isDone: boolean) => {
      tasks.forEach((task) => {
        if (isRecurringTask(task)) {
          const dates = (task.completedDates ?? []).filter((date) => date !== dateKey);
          void updateTask({
            id: task.id,
            patch: {
              completedDates: isDone ? [...dates, dateKey] : dates,
              ...getTimerPausePatch(task, isDone),
              ...getStatusPatch(task, isDone),
            },
          });
          return;
        }
        void updateTask({
          id: task.id,
          patch: {
            status: isDone ? 'done' : 'active',
            ...getTimerPausePatch(task, isDone),
            ...getStatusPatch(task, isDone),
          },
        });
      });
    },
    [updateTask],
  );

  return { toggleTask, setTasksDone };
}