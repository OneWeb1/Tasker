import { getPeriodStyle } from '@/entities/period';
import { formatShortDate } from '@/shared/lib/utils/date';
import type { PeriodCarouselItem } from '../../model/types/periodItem';
import styles from './PeriodTile.module.css';

interface PeriodTileProps {
  item: PeriodCarouselItem;
  isActive: boolean;
  onSelect: () => void;
}

export function PeriodTile({ item, isActive, onSelect }: PeriodTileProps) {
  const { period, progress, completion } = item;
  const range =
    period.startDate === period.endDate
      ? formatShortDate(period.startDate)
      : `${formatShortDate(period.startDate)} — ${formatShortDate(period.endDate)}`;
  const badge = progress.status === 'finished' ? null : `${progress.daysLeft} дн.`;

  return (
    <button
      type="button"
      className={styles.tile}
      style={getPeriodStyle(period)}
      data-active={isActive || undefined}
      data-status={progress.status}
      aria-current={isActive || undefined}
      onClick={onSelect}
    >
      <span className={styles.top}>
        <span className={styles.chip} aria-hidden="true">
          <span className={styles.chipFill} style={{ width: `${completion}%` }} />
        </span>
        {badge && <span className={styles.badge}>{badge}</span>}
      </span>
      <span className={styles.name}>{period.title}</span>
      <span className={styles.value}>{completion}%</span>
      <span className={styles.range}>{range}</span>
    </button>
  );
}