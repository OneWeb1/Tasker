import { addDaysToKey, formatShortDate, getMonthRange, getWeekRange, toDateKey } from '@/shared/lib/utils/date';
import { parseDateKey } from '@/shared/lib/utils/date';
import type { PeriodScale } from '../../model/constants/periodScales';
import type { Period } from '../../model/types/period';

interface ScaleRange {
  from: string;
  to: string;
}

type RelativeLabels = readonly [previous: string, current: string, next: string];

const QUARTER_MONTHS = 3;

const RELATIVE_LABELS: Record<PeriodScale, RelativeLabels> = {
  day: ['Вчора', 'Сьогодні', 'Завтра'],
  week: ['Минулий тиждень', 'Цей тиждень', 'Наступний тиждень'],
  month: ['Минулий місяць', 'Цей місяць', 'Наступний місяць'],
  quarter: ['Минулий квартал', 'Цей квартал', 'Наступний квартал'],
  year: ['Минулий рік', 'Цей рік', 'Наступний рік'],
};

const getTodayRange = (scale: PeriodScale, todayKey: string): ScaleRange => {
  const today = parseDateKey(todayKey);
  const year = today.getFullYear();

  switch (scale) {
    case 'day':
      return { from: todayKey, to: todayKey };
    case 'week':
      return getWeekRange(todayKey);
    case 'month':
      return getMonthRange(todayKey);
    case 'quarter': {
      const firstMonth = Math.floor(today.getMonth() / QUARTER_MONTHS) * QUARTER_MONTHS;
      return {
        from: toDateKey(new Date(year, firstMonth, 1)),
        to: toDateKey(new Date(year, firstMonth + QUARTER_MONTHS, 0)),
      };
    }
    case 'year':
      return {
        from: toDateKey(new Date(year, 0, 1)),
        to: toDateKey(new Date(year, 11, 31)),
      };
  }
};

const getFallbackLabel = (scale: PeriodScale, period: Period): string => {
  if (scale === 'day') {
    return `${formatShortDate(period.startDate)}, ${period.title.toLowerCase()}`;
  }
  if (scale === 'week') {
    return `${formatShortDate(period.startDate)} — ${formatShortDate(period.endDate)}`;
  }
  return period.title;
};

export const getPeriodLabel = (scale: PeriodScale, period: Period, todayKey: string): string => {
  const [previous, current, next] = RELATIVE_LABELS[scale];
  const range = getTodayRange(scale, todayKey);

  if (period.startDate === range.from && period.endDate === range.to) return current;
  if (period.endDate === addDaysToKey(range.from, -1)) return previous;
  if (period.startDate === addDaysToKey(range.to, 1)) return next;
  return getFallbackLabel(scale, period);
};