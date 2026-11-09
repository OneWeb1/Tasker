import { diffDays } from '@/shared/lib/utils/date';
import type { Period } from '../../model/types/period';

export type PeriodStatus = 'upcoming' | 'active' | 'finished';

export interface PeriodProgress {
  daysLeft: number;
  totalDays: number;
  elapsedDays: number;
  status: PeriodStatus;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const getPeriodProgress = (period: Period, todayKey: string): PeriodProgress => {
  const totalDays = Math.max(diffDays(period.startDate, period.endDate), 1);
  const elapsedDays = clamp(diffDays(period.startDate, todayKey), 0, totalDays);
  const status: PeriodStatus =
    todayKey < period.startDate ? 'upcoming' : todayKey > period.endDate ? 'finished' : 'active';

  return {
    daysLeft: Math.max(diffDays(todayKey, period.endDate), 0),
    totalDays,
    elapsedDays,
    status,
  };
};