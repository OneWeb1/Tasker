import type { TaskSearchEntry } from '@/entities/task';
import type { SearchFilters } from '../../types/searchScreen';
import { matchesQuery } from '../matchesQuery';

const SCOPE_KIND = { tasks: 'task', subtasks: 'subtask' } as const;

export const filterSearchEntries = (
  entries: readonly TaskSearchEntry[],
  filters: SearchFilters & { term: string },
): TaskSearchEntry[] => {
  const { term, scope, status, priority } = filters;
  if (scope === 'notes') return [];

  return entries.filter(
    (entry) =>
      (scope === 'all' || entry.kind === SCOPE_KIND[scope]) &&
      (status === 'all' || entry.status === status) &&
      (priority === 'all' || entry.priority === priority) &&
      matchesQuery(term, entry.title, entry.description),
  );
};