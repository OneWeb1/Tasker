import { useLayoutEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { ACTIVITY_LEVELS, ACTIVITY_WEEKDAY_LABELS } from '../../model/constants/activity';
import { useActivityHeatmap } from '../../model/hooks/useActivityHeatmap';
import { ActivityCell } from './ActivityCell';
import styles from './ActivityHeatmap.module.css';

export function ActivityHeatmap() {
  const { weeks, cells, months, selected, selectDate } = useActivityHeatmap();
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;
  }, []);

  return (
    <section className={styles.root} aria-labelledby="activity-title">
      <h2 id="activity-title" className={styles.title}>
        Активність
      </h2>
      <div className={styles.card}>
        {selected && (
          <p className={styles.caption} role="status">
            {selected.label} · {selected.summary}
          </p>
        )}

        <div className={styles.chart}>
          <div className={styles.weekdays} aria-hidden="true">
            <span />
            {ACTIVITY_WEEKDAY_LABELS.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>
          <div ref={scrollRef} className={styles.scroll}>
            <div className={styles.grid} style={{ '--weeks': weeks } as CSSProperties}>
              <div className={styles.months} aria-hidden="true">
                {months.map((month) => (
                  <span
                    key={month.column}
                    className={styles.month}
                    style={{ gridColumnStart: month.column + 1 }}
                  >
                    {month.label}
                  </span>
                ))}
              </div>
              <div className={styles.cells}>
                {cells.map((cell) => (
                  <ActivityCell
                    key={cell.dateKey}
                    dateKey={cell.dateKey}
                    level={cell.level}
                    label={cell.label}
                    summary={cell.summary}
                    isFuture={cell.isFuture}
                    isSelected={cell.dateKey === selected?.dateKey}
                    onSelect={selectDate}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.legend} aria-hidden="true">
          <span>Менше</span>
          {ACTIVITY_LEVELS.map((level) => (
            <span key={level} className={styles.cell} data-level={level} />
          ))}
          <span>Більше</span>
        </div>
      </div>
    </section>

  );
}