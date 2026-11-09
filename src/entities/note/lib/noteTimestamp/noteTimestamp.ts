import { parseDateKey } from '@/shared/lib/utils/date';

export const buildNoteTimestamp = (dateKey: string, now: Date = new Date()): number => {
  const day = parseDateKey(dateKey);
  day.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  return day.getTime();
};