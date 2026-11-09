import type { DiffKind } from '@/shared/ui/DiffSign';

export interface FieldDiff {
  before: string;
  after: string;
  isChanged: boolean;
}

export type TaskDiffField =
  | 'title'
  | 'description'
  | 'category'
  | 'project'
  | 'dates'
  | 'schedule'
  | 'weekdays'
  | 'priority';

export type TaskFieldDiffs = Record<TaskDiffField, FieldDiff>;

export interface TaskDiffValue {
  marks: ReadonlyMap<string, DiffKind>;
  fields: TaskFieldDiffs;
}