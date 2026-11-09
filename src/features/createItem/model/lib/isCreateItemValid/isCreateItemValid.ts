import type { TaskSchedule } from '@/entities/task';
import type { CreateItemKind } from '../../slice/createItemSlice';

interface CreateItemValidationInput {
  kind: CreateItemKind;
  title: string;
  date: string;
  minDate: string;
  schedule: TaskSchedule;
  weekdays: readonly number[];
  hasTime: boolean;
  startTime: string;
  endTime: string;
}

export const isCreateItemValid = ({
  kind,
  title,
  date,
  minDate,
  schedule,
  weekdays,
  hasTime,
  startTime,
  endTime,
}: CreateItemValidationInput): boolean =>
  title !== '' &&
  (kind !== 'task' ||
    (date >= minDate &&
      (schedule !== 'weekly' || weekdays.length > 0) &&
      (!hasTime || endTime > startTime)));