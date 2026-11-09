import { createId } from '@/shared/lib/utils/createId';
import type { NewTask, Task, TaskFieldChange, TaskStatusChange } from '../../model/types/task';

export type TaskHistoryEntry =
  | { id: string; at: number; kind: 'status'; status: TaskStatusChange['status'] }
  | { id: string; at: number; kind: 'field'; field: TaskFieldChange['field']; value: string | null }
  | { id: string; at: number; kind: 'created' };

const CREATED_ENTRY_ID = 'created';

export const stampNewTask = (task: NewTask, now: number): NewTask => ({
  ...task,
  createdAt: now,
  statusLog: [
    {
      id: createId(),
      status: task.status === 'postponed' ? 'postponed' : 'active',
      changedAt: now,
    },
  ],
});

export const appendStatusChange = (
  task: Task,
  status: TaskStatusChange['status'],
  now: number,
): { statusLog: TaskStatusChange[] } => ({
  statusLog: [...(task.statusLog ?? []), { id: createId(), status, changedAt: now }],
});

export const buildTaskHistory = (task: Task): TaskHistoryEntry[] => {
  const events: { at: number; entry: TaskHistoryEntry }[] = [
    ...(task.statusLog ?? []).map((change) => ({
      at: change.changedAt,
      entry: {
        id: change.id,
        at: change.changedAt,
        kind: 'status' as const,
        status: change.status,
      },
    })),
    ...(task.changeLog ?? []).map((change) => ({
      at: change.changedAt,
      entry: {
        id: change.id,
        at: change.changedAt,
        kind: 'field' as const,
        field: change.field,
        value: change.value,
      },
    })),
  ];
  const changes = events.sort((a, b) => a.at - b.at).map(({ entry }) => entry);

  return task.createdAt === undefined
    ? changes
    : [{ id: CREATED_ENTRY_ID, at: task.createdAt, kind: 'created' }, ...changes];
};