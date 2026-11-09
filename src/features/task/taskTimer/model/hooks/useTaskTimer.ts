import { useCallback, useEffect, useState } from 'react';
import {
  getTaskTimerElapsedSeconds,
  isTaskTimerEnabled,
  isTaskTimerRunningOn,
  pauseTaskTimer,
  resetTaskTimer,
  setTaskTimerEnabled,
  startTaskTimer,
  useUpdateTaskMutation,
} from '@/entities/task';
import type { Task } from '@/entities/task';

const TICK_MS = 1000;

export function useTaskTimer(task: Task, dateKey: string) {
  const [updateTask] = useUpdateTaskMutation();
  const [now, setNow] = useState(() => Date.now());
  const isEnabled = isTaskTimerEnabled(task);
  const isRunning = isTaskTimerRunningOn(task, dateKey);

  useEffect(() => {
    if (!isRunning) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, [isRunning]);

  const save = useCallback(
    (timer: NonNullable<Task['timer']>) => {
      void updateTask({ id: task.id, patch: { timer } });
    },
    [task.id, updateTask],
  );

  const setEnabled = useCallback(
    (enabled: boolean) => save(setTaskTimerEnabled(task, enabled, Date.now())),
    [save, task],
  );

  const toggleRunning = useCallback(() => {
    const current = Date.now();
    if (isRunning) {
      const paused = pauseTaskTimer(task, current);
      if (paused) save(paused);
      return;
    }
    save(startTaskTimer(task, dateKey, current));
  }, [dateKey, isRunning, save, task]);

  const reset = useCallback(
    () => save(resetTaskTimer(task, dateKey, Date.now())),
    [dateKey, save, task],
  );

  return {
    isEnabled,
    isRunning,
    elapsedSeconds: getTaskTimerElapsedSeconds(task, dateKey, now),
    setEnabled,
    toggleRunning,
    reset,
  };
}