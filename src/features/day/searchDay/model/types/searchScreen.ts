import type { TaskPriority, TaskStatus } from '@/entities/task';

export type SearchScope = 'all' | 'tasks' | 'subtasks' | 'notes';
export type SearchResultKind = 'task' | 'subtask' | 'note';
export type SearchStatusFilter = 'all' | TaskStatus;
export type SearchPriorityFilter = 'all' | TaskPriority;

export interface SearchFilters {
  scope: SearchScope;
  status: SearchStatusFilter;
  priority: SearchPriorityFilter;
}