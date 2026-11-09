import { formatClock } from '@/shared/lib/utils/date';
import styles from './NowIndicator.module.css';

interface NowIndicatorProps {
  minutes: number;
  top: string;
  isInset?: boolean;
}

export function NowIndicator({ minutes, top, isInset = false }: NowIndicatorProps) {
  const label = formatClock(minutes);

  return (
    <div
      className={styles.now}
      data-inset={isInset || undefined}
      style={{ top }}
      role="img"
      aria-label={`Зараз ${label}`}
    >
      <span className={styles.time}>{label}</span>
      <span className={styles.line} />
    </div>
  );
}