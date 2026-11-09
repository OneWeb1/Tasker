import { EventCard } from '@/entities/event';
import { ProjectBadge } from '@/entities/project';
import { TIMELINE_CARD_GAP, TIMELINE_GAP_HEIGHT } from '@/shared/config/layout';
import { formatClock, formatDuration } from '@/shared/lib/utils/date';
import { useDayTimeline } from '../../model/hooks/useDayTimeline';
import { detectOverlaps } from '../../model/lib/detectOverlaps';
import { getEntryMinHeight } from '../../model/lib/entryMarks';
import type { NowMarker } from '../../model/lib/locateNowMarker';
import { NowIndicator } from '../NowIndicator';
import styles from './DayTimeline.module.css';

const NOW_LABEL_CLEARANCE = 28;
const MINUTES_IN_DAY = 24 * 60;

const getGapText = (from: number, to: number): string =>
  `${formatDuration(to - from)} ${to >= MINUTES_IN_DAY ? 'вільно,' : 'між задачами'}`;

const getMarkerTop = ({ position, progress }: NowMarker): string => {
  if (position === 'before') return `${-TIMELINE_CARD_GAP / 2}px`;
  if (position === 'after') return `calc(100% + ${TIMELINE_CARD_GAP / 2}px)`;
  return `${progress * 100}%`;
};

const getCardsPadding = (marker: NowMarker | null, itemsCount: number) => ({
  paddingTop: TIMELINE_CARD_GAP + (marker?.position === 'before' ? NOW_LABEL_CLEARANCE : 0),
  paddingBottom:
    TIMELINE_CARD_GAP +
    (marker?.position === 'after' && marker.itemIndex === itemsCount - 1
      ? NOW_LABEL_CLEARANCE
      : 0),
});

export function DayTimeline() {
  const { rows, isEmpty, nowMarker, openTask, createTask, toggleCollapse } = useDayTimeline();

  return (
    <div>
      {isEmpty && <p className={styles.empty}>Подій на цей день немає</p>}
      <div className={styles.timeline}>
        {rows.map((row, rowIndex) => {
          const marker = nowMarker?.rowKey === row.key ? nowMarker : null;
          const visibleItems = row.items.filter((item) => !item.isHidden);
          const overlaps = detectOverlaps(visibleItems);
          const visibleIndexes = new Map(
            visibleItems.map((item, index) => [item.event.id, index] as const),
          );
          const isLastRow = rowIndex === rows.length - 1;
          const isTrailingGap = row.gap !== null && row.gap.to >= MINUTES_IN_DAY;

          return (
            <div key={row.key} className={styles.row}>
              {marker && marker.itemIndex === null && (
                <NowIndicator minutes={marker.minutes} top={getMarkerTop(marker)} />
              )}
              {row.gap && (
                <>
                  <span className={styles.label}>{row.startLabel}</span>
                  <div
                    className={styles.gap}
                    style={{
                      minHeight: TIMELINE_GAP_HEIGHT,
                      margin: `${TIMELINE_CARD_GAP}px 0`,
                    }}
                  >
                    <p className={styles.gapText}>
                      {getGapText(
                        isTrailingGap && marker
                          ? Math.max(row.gap.from, marker.minutes)
                          : row.gap.from,
                        row.gap.to,
                      )}
                    </p>
                    {isTrailingGap && (
                      <button type="button" className={styles.gapAction} onClick={createTask}>
                        Створити задачу
                      </button>
                    )}
                  </div>
                </>
              )}
              {row.items.length > 0 && (
                <>
                  <span className={styles.rangeLabel}>
                    <span>{row.startLabel}</span>
                    {isLastRow && (
                      <span>{formatClock(Math.max(...row.items.map((item) => item.end)))}</span>
                    )}
                  </span>
                  <div
                    className={styles.cards}
                    style={{
                      gap: TIMELINE_CARD_GAP,
                      ...getCardsPadding(marker, row.items.length),
                    }}
                  >
                    {row.items.map(
                      ({
                        event,
                        project,
                        categoryColor,
                        start,
                        end,
                        isCollapsible,
                        isCollapsed,
                        isHidden,
                      }) => {
                        const visibleIndex = visibleIndexes.get(event.id);

                        return (
                      <div
                        key={event.id}
                        className={styles.item}
                        data-hidden={isHidden}
                        style={{ marginTop: isHidden ? -TIMELINE_CARD_GAP : 0 }}
                      >
                        {visibleIndex !== undefined && overlaps[visibleIndex] && (
                          <span className={styles.overlap} style={{ top: -TIMELINE_CARD_GAP / 2 }}>
                            Перетин
                          </span>
                        )}
                        {visibleIndex !== undefined && marker?.itemIndex === visibleIndex && (
                          <NowIndicator
                            isInset
                            minutes={marker.minutes}
                            top={getMarkerTop(marker)}
                          />
                        )}
                        <div className={styles.clip}>
                          <div
                            className={styles.body}
                            style={{ minHeight: getEntryMinHeight(start, end) }}
                          >
                        <EventCard
                          event={event}
                          categoryColor={categoryColor}
                          meta={project && <ProjectBadge project={project} />}
                          collapse={
                            isCollapsible
                              ? { isCollapsed, onToggle: () => toggleCollapse(event.id) }
                              : undefined
                          }
                          onOpen={event.source === 'local' ? () => openTask(event.id) : undefined}
                        />
                          </div>
                        </div>
                      </div>
                        );
                      },
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>

  );
}