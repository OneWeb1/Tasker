import { parseDateKey, toDateKey } from './dateKey';
import { formatDayLabel } from './formatDayLabel';

export interface WeekDay {
  dateKey: string;
  day: number;
  weekday: string;
}

export const getWeekDays = (dateKey: string): WeekDay[] => {
  const anchor = parseDateKey(dateKey);
  const mondayOffset = (anchor.getDay() + 6) % 7;

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(
      anchor.getFullYear(),
      anchor.getMonth(),
      anchor.getDate() - mondayOffset + index,
    );
    return {
      dateKey: toDateKey(date),
      day: date.getDate(),
      weekday: formatDayLabel(date, 'weekday'),
    };
  });
};