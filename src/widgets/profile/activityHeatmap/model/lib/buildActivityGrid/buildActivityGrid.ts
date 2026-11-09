import { addDaysToKey, getDateRange, getWeekRange, parseDateKey } from '@/shared/lib/utils/date';
import type { DayActivity } from '@/entities/task';
import { ACTIVITY_LEVELS, ACTIVITY_MIN_TOTAL } from '../../constants/activity';

export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

export interface ActivityCell {
  dateKey: string;
  done: number;
  total: number;
  percent: number;
  level: ActivityLevel;
  isFuture: boolean;
}

export interface ActivityMonth {
  column: number;
  monthIndex: number;
}

export interface ActivityGrid {
  cells: ActivityCell[];
  months: ActivityMonth[];
  total: number;
}

const DAYS_IN_WEEK = 7;
const MIN_MONTH_COLUMNS_GAP = 3;

const toLevel = (done: number, total: number): ActivityLevel => {
  if (total === 0 || done === 0) return 0;
  const ratio = done / Math.max(total, ACTIVITY_MIN_TOTAL);
  if (ratio >= 1) return 5;
  if (ratio > 0.9) return 4;
  if (ratio > 0.6) return 3;
  if (ratio > 0.3) return 2;
  return 1;
};

export const getActivityRange = (
  todayKey: string,
  weeks: number,
): { from: string; to: string } => {
  const lastWeek = getWeekRange(todayKey);
  return { from: addDaysToKey(lastWeek.from, -(weeks - 1) * DAYS_IN_WEEK), to: lastWeek.to };
};

export const buildActivityGrid = (
  activity: Readonly<Record<string, DayActivity>>,
  todayKey: string,
  weeks: number,
): ActivityGrid => {
  const range = getActivityRange(todayKey, weeks);
  const keys = getDateRange(range.from, range.to);

  let total = 0;
  const cells = keys.map<ActivityCell>((dateKey) => {
    const isFuture = dateKey > todayKey;
    const { done, total: dayTotal } = isFuture
      ? { done: 0, total: 0 }
      : (activity[dateKey] ?? { done: 0, total: 0 });
    total += done;

    return {
      dateKey,
      done,
      total: dayTotal,
      percent: dayTotal === 0 ? 0 : Math.round((done / dayTotal) * 100),
      level: toLevel(done, dayTotal),
      isFuture,
    };
  });

  const months: ActivityMonth[] = [];
  for (let column = 0; column < weeks; column += 1) {
    const monthIndex = parseDateKey(keys[column * DAYS_IN_WEEK] as string).getMonth();
    if (months[months.length - 1]?.monthIndex !== monthIndex) months.push({ column, monthIndex });
  }

  return {
    cells,
    months: months.filter((month, index) => {
      const next = months[index + 1];
      return !next || next.column - month.column >= MIN_MONTH_COLUMNS_GAP;
    }),
    total,
  };
};