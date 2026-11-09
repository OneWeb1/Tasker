import type { CalendarEvent } from '../../model/types/event';

export const formatEventTime = ({
  startTime,
  endTime,
}: Pick<CalendarEvent, 'startTime' | 'endTime'>): string => `${startTime} – ${endTime}`;