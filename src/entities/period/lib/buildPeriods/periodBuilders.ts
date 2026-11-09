import {
  addDaysToKey,
  formatDayLabel,
  getDateRange,
  getMonthRange,
  getWeekRange,
  parseDateKey,
  toDateKey,
} from '@/shared/lib/utils/date';
import { MONTH_TITLES } from '../../model/constants/months';
import type { PeriodScale } from '../../model/constants/periodScales';
import type { Period } from '../../model/types/period';

export interface PeriodBuildContext {
  anchorKey: string;
  todayKey: string;
}

const YEARS_AROUND = 5;
const QUARTERS_IN_YEAR = 4;
const MONTHS_IN_QUARTER = 3;
const DAYS_IN_WEEK = 7;

const getYear = (dateKey: string): number => parseDateKey(dateKey).getFullYear();

const buildYears = ({ todayKey }: PeriodBuildContext): Period[] => {
  const year = getYear(todayKey);
  return Array.from({ length: YEARS_AROUND * 2 + 1 }, (_, position) => {
    const value = year - YEARS_AROUND + position;
    return {
      id: `year-${value}`,
      title: String(value),
      startDate: toDateKey(new Date(value, 0, 1)),
      endDate: toDateKey(new Date(value, 11, 31)),
    };
  });
};

const buildQuarters = ({ anchorKey }: PeriodBuildContext): Period[] => {
  const year = getYear(anchorKey);
  return Array.from({ length: QUARTERS_IN_YEAR }, (_, quarter) => {
    const firstMonth = quarter * MONTHS_IN_QUARTER;
    return {
      id: `quarter-${year}-${quarter + 1}`,
      title: `${quarter + 1} квартал`,
      startDate: toDateKey(new Date(year, firstMonth, 1)),
      endDate: toDateKey(new Date(year, firstMonth + MONTHS_IN_QUARTER, 0)),
    };
  });
};

const buildMonths = ({ anchorKey }: PeriodBuildContext): Period[] => {
  const anchor = parseDateKey(anchorKey);
  const year = anchor.getFullYear();
  const firstMonth = Math.floor(anchor.getMonth() / MONTHS_IN_QUARTER) * MONTHS_IN_QUARTER;

  return Array.from({ length: MONTHS_IN_QUARTER }, (_, offset) => {
    const monthIndex = firstMonth + offset;
    const { from, to } = getMonthRange(toDateKey(new Date(year, monthIndex, 1)));
    return {
      id: `month-${year}-${monthIndex + 1}`,
      title: MONTH_TITLES[monthIndex] ?? '',
      startDate: from,
      endDate: to,
    };
  });
};

const buildWeeks = ({ anchorKey }: PeriodBuildContext): Period[] => {
  const { from: monthFrom, to: monthTo } = getMonthRange(anchorKey);
  const last = getWeekRange(monthTo).from;
  const weeks: Period[] = [];

  for (
    let from = getWeekRange(monthFrom).from, position = 0;
    from <= last;
    from = addDaysToKey(from, DAYS_IN_WEEK), position += 1
  ) {
    weeks.push({
      id: `week-${from}`,
      title: `Тиждень ${position + 1}`,
      startDate: from,
      endDate: addDaysToKey(from, DAYS_IN_WEEK - 1),
    });
  }
  return weeks;
};

const buildDays = ({ anchorKey }: PeriodBuildContext): Period[] => {
  const { from, to } = getWeekRange(anchorKey);
  return getDateRange(from, to).map((dateKey) => ({
    id: `day-${dateKey}`,
    title: formatDayLabel(parseDateKey(dateKey), 'weekdayLong'),
    startDate: dateKey,
    endDate: dateKey,
  }));
};

export const PERIOD_BUILDERS: Record<PeriodScale, (context: PeriodBuildContext) => Period[]> = {
  year: buildYears,
  quarter: buildQuarters,
  month: buildMonths,
  week: buildWeeks,
  day: buildDays,
};