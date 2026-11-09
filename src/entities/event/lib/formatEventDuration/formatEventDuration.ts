import { formatDuration, timeToMinutes } from '@/shared/lib/utils/date';
import type { CalendarEvent } from '../../model/types/event';

export const formatEventDuration = ({
  startTime,
  endTime,
}: Pick<CalendarEvent, 'startTime' | 'endTime'>): string =>
  formatDuration(Math.max(0, timeToMinutes(endTime) - timeToMinutes(startTime)));