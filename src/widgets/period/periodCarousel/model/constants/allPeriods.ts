import type { PeriodScale } from '@/entities/period';

export const DOTS_IDLE_DELAY_MS = 3000;

export const ALL_PERIODS_LABELS: Record<PeriodScale, string> = {
  year: 'Усі роки',
  quarter: 'Усі квартали',
  month: 'Усі місяці',
  week: 'Усі тижні',
  day: 'Усі дні',
};