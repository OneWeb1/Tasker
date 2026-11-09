import type { SearchResultKind, SearchScope, SearchStatusFilter } from '@/features/day/searchDay';

export const SEARCH_KIND_TITLES: Record<SearchResultKind, string> = {
  task: 'Завдання',
  subtask: 'Підзавдання',
  note: 'Нотатки',
};

export const SEARCH_SCOPE_TABS: readonly { value: SearchScope; label: string }[] = [
  { value: 'all', label: 'Усе' },
  { value: 'tasks', label: 'Завдання' },
  { value: 'subtasks', label: 'Підзавдання' },
  { value: 'notes', label: 'Нотатки' },
];

export const SEARCH_STATUS_OPTIONS: readonly { value: SearchStatusFilter; label: string }[] = [
  { value: 'all', label: 'Усі статуси' },
  { value: 'active', label: 'Активні' },
  { value: 'done', label: 'Виконані' },
  { value: 'postponed', label: 'Відкладені' },
];