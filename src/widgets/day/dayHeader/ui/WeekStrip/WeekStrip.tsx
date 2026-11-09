import type { CSSProperties } from 'react';
import { useHorizontalSwipe } from '@/shared/lib/hooks/useHorizontalSwipe';
import { DayPill } from '@/shared/ui/DayPill';
import styles from './WeekStrip.module.css';

interface WeekStripDay {
  dateKey: string;
  day: number;
  weekday: string;
  isSelected: boolean;
  isToday: boolean;
  isDisabled: boolean;
}

interface WeekStripWeeks {
  previous: readonly WeekStripDay[];
  current: readonly WeekStripDay[];
  next: readonly WeekStripDay[];
}

interface WeekStripProps {
  weeks: WeekStripWeeks;
  canShiftPrevious: boolean;
  canShiftNext: boolean;
  onSelect: (dateKey: string) => void;
  onShiftWeek: (direction: 1 | -1) => void;
}

export function WeekStrip({
  weeks,
  canShiftPrevious,
  canShiftNext,
  onSelect,
  onShiftWeek,
}: WeekStripProps) {
  const { offset, isDragging, isSettling, handlers, onTransitionEnd } = useHorizontalSwipe({
    onSwipeLeft: () => onShiftWeek(1),
    onSwipeRight: () => onShiftWeek(-1),
    canSwipeLeft: canShiftNext,
    canSwipeRight: canShiftPrevious,
  });

  const selectedIndex = weeks.current.findIndex((day) => day.isSelected);

  const panels = [
    { key: 'previous', days: weeks.previous, isCurrent: false },
    { key: 'current', days: weeks.current, isCurrent: true },
    { key: 'next', days: weeks.next, isCurrent: false },
  ] as const;

  return (
    <div className={styles.viewport} data-horizontal-swipe {...handlers}>
      <div
        className={styles.track}
        data-moving={isDragging || isSettling}
        data-settling={isSettling}
        style={{
          transform: `translate3d(calc(-100% + ${offset}px + var(--week-swipe, 0) * 100%), 0, 0)`,
        }}
        onTransitionEnd={onTransitionEnd}
      >
        {panels.map((panel) => (
          <div
            key={panel.key}
            className={styles.week}
            data-current={panel.isCurrent}
            aria-hidden={!panel.isCurrent}
          >
            {panel.days.map((day) => (
              <DayPill
                key={day.dateKey}
                weekday={day.weekday}
                day={day.day}
                isActive={day.isSelected}
                isToday={day.isToday}
                isDisabled={day.isDisabled}
                onClick={() => onSelect(day.dateKey)}
              />
            ))}
          </div>
        ))}
        {selectedIndex >= 0 && (
          <span
            className={styles.indicator}
            style={{ '--day-index': selectedIndex } as CSSProperties}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}