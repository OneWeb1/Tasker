import type { Task, TaskTimer } from '../../model/types/task';

const EMPTY_TIMER: TaskTimer = { enabled: false, elapsedMsByDate: {}, running: null };

const readTimer = (task: Task): TaskTimer => task.timer ?? EMPTY_TIMER;

const flush = (timer: TaskTimer, now: number): TaskTimer => {
  const { running } = timer;
  if (running === null) return timer;

  const spent = Math.max(0, now - running.since);

  return {
    ...timer,
    running: null,
    elapsedMsByDate: {
      ...timer.elapsedMsByDate,
      [running.dateKey]: (timer.elapsedMsByDate[running.dateKey] ?? 0) + spent,
    },
  };
};

export const isTaskTimerEnabled = (task: Task): boolean => readTimer(task).enabled;

export const isTaskTimerRunningOn = (task: Task, dateKey: string): boolean => {
  const { running } = readTimer(task);
  return running !== null && running.dateKey === dateKey;
};

export const getTaskTimerElapsedSeconds = (task: Task, dateKey: string, now: number): number => {
  const timer = readTimer(task);
  const { running } = timer;
  const base = timer.elapsedMsByDate[dateKey] ?? 0;
  const live = running !== null && running.dateKey === dateKey ? Math.max(0, now - running.since) : 0;

  return Math.floor((base + live) / 1000);
};

export const startTaskTimer = (task: Task, dateKey: string, now: number): TaskTimer => ({
  ...flush(readTimer(task), now),
  running: { dateKey, since: now },
});

export const pauseTaskTimer = (task: Task, now: number): TaskTimer | null => {
  const timer = readTimer(task);
  return timer.running === null ? null : flush(timer, now);
};

export const resetTaskTimer = (task: Task, dateKey: string, now: number): TaskTimer => {
  const timer = readTimer(task);
  const elapsedMsByDate = { ...timer.elapsedMsByDate };
  delete elapsedMsByDate[dateKey];

  const isRunningOnDate = timer.running !== null && timer.running.dateKey === dateKey;

  return {
    ...timer,
    elapsedMsByDate,
    running: isRunningOnDate ? { dateKey, since: now } : timer.running,
  };
};

export const setTaskTimerEnabled = (task: Task, enabled: boolean, now: number): TaskTimer => ({
  ...flush(readTimer(task), now),
  enabled,
});