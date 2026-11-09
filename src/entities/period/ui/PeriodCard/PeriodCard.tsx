import { formatShortDate } from '@/shared/lib/utils/date';
import { getPeriodStyle } from '../../lib/periodStyle';
import type { PeriodProgress, PeriodStatus } from '../../lib/getPeriodProgress';
import type { Period } from '../../model/types/period';
import styles from './PeriodCard.module.css';

const STATUS_LABELS: Record<PeriodStatus, string> = {
  upcoming: 'Попереду',
  active: 'Триває',
  finished: 'Завершено',
};

interface PeriodCardProps {
  period: Period;
  progress: PeriodProgress;
  percent: number;
  isFlat?: boolean;
}

export function PeriodCard({ period, progress, percent, isFlat = false }: PeriodCardProps) {
  return (
    <div
      className={styles.card}
      data-status={progress.status}
      data-flat={isFlat || undefined}
      style={getPeriodStyle(period)}
    >
      <div className={styles.top}>
        <span className={styles.title}>{period.title}</span>
        <span className={styles.badge}>{STATUS_LABELS[progress.status]}</span>
      </div>
      <span className={styles.range}>
        {period.startDate === period.endDate
          ? formatShortDate(period.startDate)
          : `${formatShortDate(period.startDate)} — ${formatShortDate(period.endDate)}`}
      </span>
      <div className={styles.bottom}>
        <span className={styles.bar} aria-hidden="true">
          <span className={styles.fill} style={{ width: `${percent}%` }} />
        </span>
        <span className={styles.percent}>{percent}%</span>
      </div>
    </div>
  );
}