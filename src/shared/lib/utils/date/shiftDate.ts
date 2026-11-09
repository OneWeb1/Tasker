import { parseDateKey, toDateKey } from './dateKey';

export const addDaysToKey = (dateKey: string, days: number): string => {
  const date = parseDateKey(dateKey);
  return toDateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + days));
};

export const moveToMonth = (dateKey: string, year: number, monthIndex: number): string => {
  const day = parseDateKey(dateKey).getDate();
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate();
  return toDateKey(new Date(year, monthIndex, Math.min(day, lastDayOfMonth)));
};