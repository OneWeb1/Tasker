import type { TaskDetailsStatus, TaskFieldChange, TaskPriority } from '@/entities/task';

export type TaskScreenTab = 'details' | 'activity';

export type TaskPriorityChoice = TaskPriority | 'none';

export const TASK_SCREEN_TABS: readonly { value: TaskScreenTab; label: string }[] = [
  { value: 'details', label: 'Деталі' },
  { value: 'activity', label: 'Активність' },
];

export const TASK_FIELD_CHANGE_TITLES: Record<TaskFieldChange['field'], string> = {
  title: 'Ви змінили назву на',
  description: 'Ви змінили опис',
  priority: 'Ви змінили пріоритет на',
  date: 'Ви змінили дату на',
  time: 'Ви змінили час на',
  category: 'Ви змінили категорію на',
  project: 'Ви змінили проєкт',
  schedule: 'Ви змінили повторення на',
};

export const TASK_STATUS_LABELS: Record<TaskDetailsStatus, string> = {
  active: 'До виконання',
  done: 'Виконано',
  postponed: 'Відкладено',
};