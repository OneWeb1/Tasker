import type { PointerEvent } from 'react';
import { useHorizontalSwipe } from '@/shared/lib/hooks/useHorizontalSwipe';
import { AnimatedNumber } from '@/shared/ui/AnimatedNumber';
import { CircleProgress } from '@/shared/ui/CircleProgress';
import styles from './ProgressSummary.module.css';

interface WeekProgressDay {
  dateKey: string;
  day: number;
  weekday: string;
  percent: number;
  total: number;
  isSelected: boolean;
  isToday: boolean;
  isFuture: boolean;
  isDisabled: boolean;
}

interface WeekProgressPanels {
  previous: readonly WeekProgressDay[];
  current: readonly WeekProgressDay[];
  next: readonly WeekProgressDay[];
}

interface WeekProgressProps {
  panels: WeekProgressPanels;
  canShiftPrevious: boolean;
  canShiftNext: boolean;
  onSelect: (dateKey: string) => void;
  onShiftWeek: (direction: 1 | -1) => void;
}

export function WeekProgress({
  panels,
  canShiftPrevious,
  canShiftNext,
  onSelect,
  onShiftWeek,
}: WeekProgressProps) {
  const { offset, isDragging, isSettling, handlers, onTransitionEnd } = useHorizontalSwipe({
    onSwipeLeft: () => onShiftWeek(1),
    onSwipeRight: () => onShiftWeek(-1),
    canSwipeLeft: canShiftNext,
    canSwipeRight: canShiftPrevious,
  });

  const isolate =
    <T extends (event: PointerEvent<HTMLElement>) => void>(handler: T) =>
    (event: PointerEvent<HTMLElement>) => {
      event.stopPropagation();
      handler(event);
    };

  const items = [
    { key: 'previous', days: panels.previous, isCurrent: false },
    { key: 'current', days: panels.current, isCurrent: true },
    { key: 'next', days: panels.next, isCurrent: false },
  ] as const;

  return (
    <div
      className={styles.weekViewport}
      data-horizontal-swipe
      onPointerDown={isolate(handlers.onPointerDown)}
      onPointerMove={isolate(handlers.onPointerMove)}
      onPointerUp={isolate(handlers.onPointerUp)}
      onPointerCancel={isolate(handlers.onPointerCancel)}
      onClickCapture={handlers.onClickCapture}
    >
      <div
        className={styles.weekTrack}
        data-moving={isDragging || isSettling}
        data-settling={isSettling}
        style={{ transform: `translate3d(calc(-100% + ${offset}px), 0, 0)` }}
        onTransitionEnd={onTransitionEnd}
      >
        {items.map((panel) => (
          <ul key={panel.key} className={styles.week} aria-hidden={!panel.isCurrent}>
            {panel.days.map((day) => (
              <li key={day.dateKey} className={styles.weekItem}>
                <button
                  type="button"
                  className={styles.weekDay}
                  data-selected={day.isSelected}
                  data-today={day.isToday}
                  data-future={day.isFuture}
                  data-disabled={day.isDisabled}
                  disabled={day.isDisabled}
                  tabIndex={panel.isCurrent ? 0 : -1}
                  aria-pressed={day.isSelected}
                  aria-label={`${day.weekday} ${day.day}: ${
                    day.total > 0 ? `${day.percent}%` : 'немає завдань'
                  }`}
                  onClick={() => onSelect(day.dateKey)}
                >
                  <CircleProgress
                    className={styles.weekRing}
                    percent={day.total > 0 ? day.percent : 0}
                  >
                    <span className={styles.weekValue}>
                      {day.total > 0 ? (
                        <>
                          <AnimatedNumber value={day.percent} />%
                        </>
                      ) : (
                        '—'
                      )}
                    </span>
                  </CircleProgress>
                  <span className={styles.weekLabel}>{day.weekday}</span>
                </button>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}