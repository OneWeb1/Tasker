import type { TaskTimeEntry } from '@/entities/task';

export interface TimeEntryGroup {
  dateKey: string;
  entries: TaskTimeEntry[];
}

export const groupEntriesByDate = (entries: readonly TaskTimeEntry[]): TimeEntryGroup[] => {
  const groups: TimeEntryGroup[] = [];

  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (last && last.dateKey === entry.dateKey) last.entries.push(entry);
    else groups.push({ dateKey: entry.dateKey, entries: [entry] });
  }

  return groups;
};