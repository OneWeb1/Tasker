import type { TaskSchedule } from '../types/taskSchedule';

export const TASK_SCHEDULE_LABELS: Record<TaskSchedule, string> = {
  once: 'Один день',
  week: 'Протягом тижня',
  month: 'Протягом місяця',
  year: 'Протягом року',
  daily: 'Щодня',
  weekly: 'Щотижня',
  monthly: 'Щомісяця',
  yearly: 'Щороку',
};

export const TASK_SCHEDULES: readonly { value: TaskSchedule; label: string }[] = (
  ['once', 'week', 'month', 'year', 'weekly'] as const
).map((value) => ({ value, label: TASK_SCHEDULE_LABELS[value] }));