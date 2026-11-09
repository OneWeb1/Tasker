import type { Task } from '../../model/types/task';
import type { TaskSchedule } from '../../model/types/taskSchedule';

const RECURRING_SCHEDULES: ReadonlySet<TaskSchedule> = new Set([
  'daily',
  'weekly',
  'monthly',
  'yearly',
]);

export const isRecurringSchedule = (schedule: TaskSchedule): boolean =>
  RECURRING_SCHEDULES.has(schedule);

export const getTaskSchedule = (task: Task): TaskSchedule => task.schedule ?? 'once';

export const isRecurringTask = (task: Task): boolean => getTaskSchedule(task) !== 'once';

const UNIX_EPOCH_WEEKDAY = 4;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

const yearOf = (dateKey: string): number => Number(dateKey.slice(0, 4));
const monthOf = (dateKey: string): number => Number(dateKey.slice(5, 7));
const dayOf = (dateKey: string): number => Number(dateKey.slice(8, 10));

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const daysInMonth = (year: number, month: number): number =>
  month === 2 && isLeapYear(year) ? 29 : (DAYS_IN_MONTH[month - 1] ?? 31);

const toDayNumber = (dateKey: string): number => {
  const month = monthOf(dateKey);
  const year = yearOf(dateKey) - (month <= 2 ? 1 : 0);
  const era = Math.floor(year / 400);
  const yearOfEra = year - era * 400;
  const dayOfYear =
    Math.floor((153 * (month > 2 ? month - 3 : month + 9) + 2) / 5) + dayOf(dateKey) - 1;
  const dayOfEra =
    yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
  return era * 146097 + dayOfEra - 719468;
};

const weekdayOf = (dayNumber: number): number =>
  (((dayNumber + UNIX_EPOCH_WEEKDAY) % 7) + 7) % 7;

const weekStartOf = (dayNumber: number): number =>
  dayNumber - ((weekdayOf(dayNumber) + 6) % 7);

const matchesDayOfMonth = (anchorKey: string, targetKey: string): boolean =>
  dayOf(targetKey) ===
  Math.min(dayOf(anchorKey), daysInMonth(yearOf(targetKey), monthOf(targetKey)));

const matchesWeekday = (task: Task, dateKey: string): boolean => {
  const weekday = weekdayOf(toDayNumber(dateKey));
  return task.weekdays?.length
    ? task.weekdays.includes(weekday)
    : weekdayOf(toDayNumber(task.date)) === weekday;
};

export const occursOnDate = (task: Task, dateKey: string): boolean => {
  const schedule = getTaskSchedule(task);

  if (schedule === 'once') {
    return (
      task.date === dateKey ||
      (Boolean(task.endDate) &&
        (task.endDate ?? '') > task.date &&
        dateKey >= task.date &&
        dateKey <= (task.endDate ?? ''))
    );
  }

  if (dateKey < task.date) return false;

  switch (schedule) {
    case 'daily':
      return true;
    case 'week':
      return weekStartOf(toDayNumber(task.date)) === weekStartOf(toDayNumber(dateKey));
    case 'month':
      return yearOf(task.date) === yearOf(dateKey) && monthOf(task.date) === monthOf(dateKey);
    case 'year':
      return yearOf(task.date) === yearOf(dateKey);
    case 'weekly':
      return matchesWeekday(task, dateKey);
    case 'monthly':
      return matchesDayOfMonth(task.date, dateKey);
    case 'yearly':
      return monthOf(task.date) === monthOf(dateKey) && matchesDayOfMonth(task.date, dateKey);
  }
};

export const isTaskSkippedOn = (task: Task, dateKey: string): boolean =>
  task.skippedDates?.includes(dateKey) ?? false;

export const isTaskDoneOn = (task: Task, dateKey: string): boolean =>
  isRecurringTask(task) ? (task.completedDates?.includes(dateKey) ?? false) : task.status === 'done';