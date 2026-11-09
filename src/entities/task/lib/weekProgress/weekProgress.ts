import { getWeekDays } from '@/shared/lib/utils/date';
import type { Task } from '../../model/types/task';
import { filterTasksByDate } from '../filterTasksByDate';
import { calculateTaskProgress } from '../taskProgress';

export interface WeekDayProgress {
  dateKey: string;
  day: number;
  weekday: string;
  percent: number;
  total: number;
}

export const calculateWeekProgress = (
  tasks: readonly Task[],
  dateKey: string,
): WeekDayProgress[] =>
  getWeekDays(dateKey).map((weekDay) => {
    const dayTasks = filterTasksByDate(tasks, weekDay.dateKey).filter(
      (task) => task.status !== 'postponed',
    );
    const { percent, total } = calculateTaskProgress(dayTasks, weekDay.dateKey);
    return { ...weekDay, percent, total };
  });