import type { buildPeriods, getPeriodProgress } from '@/entities/period';

type BuiltPeriod = ReturnType<typeof buildPeriods>[number];

export interface PeriodCarouselItem {
  period: BuiltPeriod;
  progress: ReturnType<typeof getPeriodProgress>;
  completion: number;
  label: string;
  isCurrent: boolean;
}