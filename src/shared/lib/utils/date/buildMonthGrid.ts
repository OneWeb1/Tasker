import { toDateKey } from './dateKey';

export interface CalendarDay {
  key: string;
  day: number;
  isCurrentMonth: boolean;
}

const DAYS_IN_WEEK = 7;
const WEEKS_IN_GRID = 6;

export const buildMonthGrid = (year: number, monthIndex: number): CalendarDay[] => {
  const offset = (new Date(year, monthIndex, 1).getDay() + 6) % DAYS_IN_WEEK;

  return Array.from({ length: DAYS_IN_WEEK * WEEKS_IN_GRID }, (_, index) => {
    const date = new Date(year, monthIndex, 1 - offset + index);
    return {
      key: toDateKey(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === monthIndex,
    };
  });
};