import { parseDateKey } from '@/shared/lib/utils/date';
import { MAX_EXPORT_DAYS } from '../../constants/export';

const DAY_MS = 86_400_000;

export const isExportRangeValid = (from: string, to: string): boolean => {
  if (!from || !to || from > to) return false;
  const days = Math.round((parseDateKey(to).getTime() - parseDateKey(from).getTime()) / DAY_MS) + 1;
  return days <= MAX_EXPORT_DAYS;
};