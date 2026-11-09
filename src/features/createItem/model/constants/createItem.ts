import type { CreateItemKind } from '../slice/createItemSlice';

export const CREATE_ITEM_KIND_ITEMS: readonly { value: CreateItemKind; label: string }[] = [
  { value: 'task', label: 'Завдання' },
  { value: 'note', label: 'Нотатка' },
  { value: 'category', label: 'Категорія' },
];

export type CreateItemMode = 'form' | 'json';

export const CREATE_ITEM_MODE_ITEMS: readonly { value: CreateItemMode; label: string }[] = [
  { value: 'form', label: 'Стандартно' },
  { value: 'json', label: 'JSON' },
];

export const TITLE_FOCUS_DELAY_MS = 300;

export const DESCRIPTION_MAX_LENGTH = 500;

export const DEFAULT_START_TIME = '09:00';

export const DEFAULT_END_TIME = '10:00';

export const DRAFT_TASK_ID = 'draft';

export const DRAFT_TASK_TITLE = 'Нове завдання';

export const PLAN_MAX_TASKS = 1000;

export const NOTE_SLOTS_MAX = 20;