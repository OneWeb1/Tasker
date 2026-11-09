import type { TaskSubtask } from '@/entities/task';

export type NewSubtask = Omit<TaskSubtask, 'id'>;

export type SubtaskTab = 'open' | 'done';

export type SubtaskPatch = Partial<NewSubtask>;

export interface SubtaskSelection {
  selectedIds: ReadonlySet<string>;
  isActive: boolean;
  onLongPress: (id: string) => void;
  onTap: (id: string) => void;
}

export interface SubtaskBulkActions {
  onToggleDone: (ids: readonly string[], done: boolean) => void;
  onDuplicate: (ids: readonly string[]) => void;
  onDelete: (ids: readonly string[]) => void;
}