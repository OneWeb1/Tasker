import type { CSSProperties } from 'react';
import { parseDateKey } from '@/shared/lib/utils/date';
import type { Period } from '../../model/types/period';

const MS_IN_DAY = 86_400_000;
const HUE_WAVE_AMPLITUDE_DEG = 30;
const HUE_WAVE_YEARS = 4;
const GRADIENT_HUE_SPREAD_DEG = 28;
const ACCENT = 'var(--color-primary-accent)';

const toUtcDay = (year: number, month: number, day: number): number =>
  Math.round(Date.UTC(year, month, day) / MS_IN_DAY);

const getHueOffset = (dateKey: string): number => {
  const date = parseDateKey(dateKey);
  const year = date.getFullYear();
  const yearStart = toUtcDay(year, 0, 1);
  const daysInYear = toUtcDay(year + 1, 0, 1) - yearStart;
  const yearProgress = (toUtcDay(year, date.getMonth(), date.getDate()) - yearStart) / daysInYear;
  const phase = ((year + yearProgress) / HUE_WAVE_YEARS) * 2 * Math.PI;
  return Math.round(Math.sin(phase) * HUE_WAVE_AMPLITUDE_DEG * 10) / 10;
};

export const getPeriodStyle = (period: Period): CSSProperties => {
  const offset = getHueOffset(period.startDate);
  return {
    '--period-from': `hsl(from ${ACCENT} calc(h + ${offset}) clamp(45, s, 85) clamp(32, l, 52))`,
    '--period-to': `hsl(from ${ACCENT} calc(h + ${offset + GRADIENT_HUE_SPREAD_DEG}) clamp(45, s, 85) clamp(40, calc(l + 10), 60))`,
    '--period-edge': `hsl(from ${ACCENT} calc(h + ${offset}) clamp(40, s, 70) 18)`,
  } as CSSProperties;
};