import { formatClock } from '@/shared/lib/utils/date';

export interface TimelineEntry {
  start: number;
  end: number;
}

interface TimelineGap {
  from: number;
  to: number;
}

export interface TimelineRow<T extends TimelineEntry> {
  key: string;
  startHour: number;
  endHour: number;
    startLabel: string;
  gap: TimelineGap | null;
  items: T[];
}

interface Segment<T extends TimelineEntry> {
  from: number;
  to: number;
  items: T[];
}

const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;

const groupIntoSegments = <T extends TimelineEntry>(entries: readonly T[]): Segment<T>[] => {
  const segments: Segment<T>[] = [];

  [...entries]
    .sort((a, b) => a.start - b.start)
    .forEach((entry) => {
      const from = Math.floor(entry.start / MINUTES_IN_HOUR);
      const to = Math.min(
        HOURS_IN_DAY,
        Math.max(Math.ceil(entry.end / MINUTES_IN_HOUR), from + 1),
      );
      const last = segments[segments.length - 1];

      if (last && from < last.to) {
        last.to = Math.max(last.to, to);
        last.items.push(entry);
        return;
      }

      segments.push({ from, to, items: [entry] });
    });

  return segments;
};

export const buildTimelineRows = <T extends TimelineEntry>(
  entries: readonly T[],
): TimelineRow<T>[] => {
  const segments = groupIntoSegments(entries);

  const rows: TimelineRow<T>[] = [];
  let hour = 0;
  let segmentIndex = 0;
  let freeFrom = 0;

  while (hour < HOURS_IN_DAY) {
    const segment = segments[segmentIndex];

    if (segment && segment.from === hour) {
      rows.push({
        key: `${segment.from}-${segment.to}`,
        startHour: segment.from,
        endHour: segment.to,
        startLabel: formatClock(segment.items[0]!.start),
        gap: null,
        items: segment.items,
      });
      freeFrom = Math.max(...segment.items.map((item) => item.end));
      hour = segment.to;
      segmentIndex += 1;
    } else {
      const nextHour = segment ? segment.from : HOURS_IN_DAY;
      const freeTo = segment ? segment.items[0]!.start : HOURS_IN_DAY * MINUTES_IN_HOUR;

      rows.push({
        key: `gap-${hour}`,
        startHour: hour,
        endHour: nextHour,
        startLabel: formatClock(freeFrom),
        gap: { from: freeFrom, to: freeTo },
        items: [],
      });
      hour = nextHour;
    }
  }

  return rows;
};