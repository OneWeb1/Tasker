import { getMonthRange } from '@/shared/lib/utils/date';
import type { PeriodScale } from '../../model/constants/periodScales';
import type { Period } from '../../model/types/period';

export const getPeriodAnchor = (scale: PeriodScale, period: Period, anchorKey: string): string => {
  if (scale !== 'week') return period.startDate;
  const monthStart = getMonthRange(anchorKey).from;
  return period.startDate < monthStart ? monthStart : period.startDate;
};