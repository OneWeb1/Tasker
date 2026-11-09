import type { ReactNode } from 'react';
import { getCategoryColorStyle } from '@/entities/category';
import type { CategoryColor } from '@/entities/category';
import { CheckIcon, DropdownIcon } from '@/shared/ui/icons';
import { formatEventDuration } from '../../lib/formatEventDuration';
import { formatEventTime } from '../../lib/formatEventTime';
import type { CalendarEvent } from '../../model/types/event';
import styles from './EventCard.module.css';

interface EventCardCollapse {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface EventCardProps {
  event: CalendarEvent;
  categoryColor?: CategoryColor;
  meta?: ReactNode;
  collapse?: EventCardCollapse;
  onOpen?: () => void;
}

const getInitial = (title: string): string =>
  Array.from(title.trim())[0]?.toUpperCase() ?? '•';

export function EventCard({ event, categoryColor, meta, collapse, onOpen }: EventCardProps) {
  return (
    <article
      className={styles.card}
      data-color={categoryColor}
      style={categoryColor ? getCategoryColorStyle(categoryColor) : undefined}
      data-interactive={onOpen !== undefined}
      data-done={event.isDone || undefined}
    >
      {collapse ? (
        <button
          type="button"
          className={`${styles.avatar} ${styles.toggle}`}
          aria-expanded={!collapse.isCollapsed}
          aria-label={collapse.isCollapsed ? 'Показати підзавдання' : 'Сховати підзавдання'}
          onClick={collapse.onToggle}
        >
          <DropdownIcon className={styles.caret} width={28} height={28} />
        </button>
      ) : (
        <span className={styles.avatar} aria-hidden="true">
          {event.isDone ? <CheckIcon width={22} height={22} /> : getInitial(event.title)}
        </span>
      )}
      <div className={styles.body}>
        <h3 className={styles.title}>
          {onOpen ? (
            <button
              type="button"
              className={`${styles.titleText} ${styles.open}`}
              onClick={onOpen}
            >
              {event.title}
            </button>
          ) : (
            <span className={styles.titleText}>{event.title}</span>
          )}
        </h3>
        <p className={styles.time}>
          {formatEventTime(event)} ({formatEventDuration(event)})
        </p>
        {meta && <div className={styles.meta}>{meta}</div>}
      </div>
    </article>
  );
}