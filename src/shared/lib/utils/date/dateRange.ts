import { parseDateKey, toDateKey } from './dateKey';
import { addDaysToKey } from './shiftDate';

export interface DateRange {
  from: string;
  to: string;
}

export const getDateRange = (from: string, to: string): string[] => {
  const keys: string[] = [];
  for (let key = from; key <= to; key = addDaysToKey(key, 1)) keys.push(key);
  return keys;
};

export const getWeekRange = (dateKey: string): DateRange => {
  const from = addDaysToKey(dateKey, -((parseDateKey(dateKey).getDay() + 6) % 7));
  return { from, to: addDaysToKey(from, 6) };
};

export const getMonthRange = (dateKey: string): DateRange => {
  const date = parseDateKey(dateKey);
  return {
    from: toDateKey(new Date(date.getFullYear(), date.getMonth(), 1)),
    to: toDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  };
};