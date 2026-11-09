export const PERIOD_SCALES = [
  { value: 'year', label: 'Рік' },
  { value: 'quarter', label: 'Квартал' },
  { value: 'month', label: 'Місяць' },
  { value: 'week', label: 'Тиждень' },
  { value: 'day', label: 'День' },
] as const;

export type PeriodScale = (typeof PERIOD_SCALES)[number]['value'];

export const DEFAULT_PERIOD_SCALE: PeriodScale = 'day';