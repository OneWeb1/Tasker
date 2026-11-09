import { TASK_SCHEDULE_LABELS } from '../../model/constants/taskSchedules';
import { TASK_WEEKDAYS } from '../../model/constants/weekdays';
import type { Task } from '../../model/types/task';
import { getTaskSchedule } from '../taskOccurrence';

export const getTaskScheduleLabel = (task: Task): string => {
  const schedule = getTaskSchedule(task);
  const label = TASK_SCHEDULE_LABELS[schedule];
  const selected = task.weekdays;

  if (schedule !== 'weekly' || !selected?.length) return label;

  const days = TASK_WEEKDAYS.filter((weekday) => selected.includes(weekday.value))
    .map((weekday) => weekday.label)
    .join(', ');

  return `${label}: ${days}`;
};