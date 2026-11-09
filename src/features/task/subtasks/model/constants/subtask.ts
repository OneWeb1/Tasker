import type { SubtaskTab } from '../types/subtask';

export const SUBTASK_TABS: readonly { value: SubtaskTab; label: string }[] = [
  { value: 'open', label: 'Відкриті' },
  { value: 'done', label: 'Виконані' },
];

export const SUBTASK_EMPTY_TEXT: Record<SubtaskTab, string> = {
  open: 'Відкритих підзавдань немає',
  done: 'Виконаних підзавдань ще немає',
};