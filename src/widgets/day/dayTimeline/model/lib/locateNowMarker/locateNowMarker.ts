export type NowPosition = 'before' | 'inside' | 'after';

export interface NowMarker {
  rowKey: string;
  minutes: number;
  itemIndex: number | null;
  position: NowPosition;
  progress: number;
}

interface TimedItem {
  start: number;
  end: number;
}

interface TimedRow {
  key: string;
  startHour: number;
  endHour: number;
  items: readonly TimedItem[];
}

const MINUTES_IN_HOUR = 60;

const locateInItems = (
  items: readonly TimedItem[],
  minutes: number,
): Pick<NowMarker, 'itemIndex' | 'position' | 'progress'> => {
  let lastStarted = -1;
  items.forEach((item, index) => {
    if (item.start <= minutes) lastStarted = index;
  });

  const current = items[lastStarted];
  if (!current) return { itemIndex: 0, position: 'before', progress: 0 };

  if (current.end > minutes && current.end > current.start) {
    return {
      itemIndex: lastStarted,
      position: 'inside',
      progress: (minutes - current.start) / (current.end - current.start),
    };
  }

  return { itemIndex: lastStarted, position: 'after', progress: 1 };
};

export const locateNowMarker = (
  rows: readonly TimedRow[],
  minutes: number | null,
): NowMarker | null => {
  if (minutes === null) return null;

  const row = rows.find(
    (item) =>
      minutes >= item.startHour * MINUTES_IN_HOUR && minutes < item.endHour * MINUTES_IN_HOUR,
  );
  if (!row) return null;

  if (row.items.length === 0) {
    const rowStart = row.startHour * MINUTES_IN_HOUR;
    const rowEnd = row.endHour * MINUTES_IN_HOUR;
    return {
      rowKey: row.key,
      minutes,
      itemIndex: null,
      position: 'inside',
      progress: (minutes - rowStart) / (rowEnd - rowStart),
    };
  }

  return { rowKey: row.key, minutes, ...locateInItems(row.items, minutes) };
};