import { createId } from '@/shared/lib/utils/createId';
import type { NewTask, Task, TaskFieldChange } from '../../model/types/task';
import { getTaskSchedule } from '../taskOccurrence';

type FieldChange = Pick<TaskFieldChange, 'field' | 'value'>;

const formatTimeRange = (start: string | null, end: string | null): string | null =>
  start && end ? `${start}–${end}` : null;

const isSameList = (a: readonly number[] = [], b: readonly number[] = []): boolean =>
  a.join(',') === b.join(',');

const detectChanges = (current: Task, patch: Partial<NewTask>): FieldChange[] => {
  const changes: FieldChange[] = [];

  if (patch.title !== undefined && patch.title !== current.title) {
    changes.push({ field: 'title', value: patch.title });
  }

  if (patch.description !== undefined && patch.description !== (current.description ?? '')) {
    changes.push({ field: 'description', value: null });
  }

  if ('priority' in patch && patch.priority !== current.priority) {
    changes.push({ field: 'priority', value: patch.priority ?? null });
  }

  if (patch.date !== undefined && patch.date !== current.date) {
    changes.push({ field: 'date', value: patch.date });
  }

  if ('endDate' in patch && (patch.endDate ?? null) !== (current.endDate ?? null)) {
    changes.push({ field: 'date', value: patch.endDate ?? patch.date ?? current.date });
  }

  const startTime = patch.startTime !== undefined ? patch.startTime : current.startTime;
  const endTime = patch.endTime !== undefined ? patch.endTime : current.endTime;
  if (startTime !== current.startTime || endTime !== current.endTime) {
    changes.push({ field: 'time', value: formatTimeRange(startTime, endTime) });
  }

  if (patch.categoryId !== undefined && patch.categoryId !== current.categoryId) {
    changes.push({ field: 'category', value: patch.categoryId });
  }

  if (patch.projectId !== undefined && patch.projectId !== current.projectId) {
    changes.push({ field: 'project', value: patch.projectId });
  }

  const schedule = 'schedule' in patch ? (patch.schedule ?? 'once') : getTaskSchedule(current);
  const weekdays = 'weekdays' in patch ? patch.weekdays : current.weekdays;
  if (schedule !== getTaskSchedule(current) || !isSameList(weekdays, current.weekdays)) {
    changes.push({ field: 'schedule', value: schedule });
  }

  return changes;
};

export const appendFieldChanges = (
  current: Task,
  patch: Partial<NewTask>,
  now: number,
): Partial<NewTask> => {
  const changes = detectChanges(current, patch);
  if (changes.length === 0) return {};

  return {
    changeLog: [
      ...(current.changeLog ?? []),
      ...changes.map((change) => ({ ...change, id: createId(), changedAt: now })),
    ],
  };
};