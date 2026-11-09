import { memo } from 'react';
import styles from './ActivityHeatmap.module.css';

interface ActivityCellProps {
  dateKey: string;
  level: number;
  label: string;
  summary: string;
  isFuture: boolean;
  isSelected: boolean;
  onSelect: (dateKey: string) => void;
}

function ActivityCellView({
  dateKey,
  level,
  label,
  summary,
  isFuture,
  isSelected,
  onSelect,
}: ActivityCellProps) {
  if (isFuture) return <span className={styles.cell} data-future="true" />;

  return (
    <button
      type="button"
      className={styles.cell}
      data-level={level}
      aria-label={`${label}: ${summary}`}
      aria-pressed={isSelected}
      onClick={() => onSelect(dateKey)}
    />
  );
}

export const ActivityCell = memo(ActivityCellView);