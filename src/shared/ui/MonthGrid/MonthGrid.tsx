import { formatDayLabel } from '@/shared/lib/utils/date';
import { FlowerIcon, LeafIcon, SnowflakeIcon, SunIcon } from '@/shared/ui/icons';
import styles from './MonthGrid.module.css';

interface MonthGridProps {
  selectedMonthIndex: number | null;
  currentMonthIndex: number | null;
  onSelect: (monthIndex: number) => void;
}

const MONTH_LABELS = Array.from({ length: 12 }, (_, index) =>
  formatDayLabel(new Date(2024, index, 1), 'month'),
);

const MONTH_ICONS = [
  SnowflakeIcon,
  SnowflakeIcon,
  FlowerIcon,
  FlowerIcon,
  FlowerIcon,
  SunIcon,
  SunIcon,
  SunIcon,
  LeafIcon,
  LeafIcon,
  LeafIcon,
  SnowflakeIcon,
] as const;

export function MonthGrid({ selectedMonthIndex, currentMonthIndex, onSelect }: MonthGridProps) {
  return (
    <div className={styles.grid} role="group" aria-label="Місяці">
      {MONTH_LABELS.map((label, monthIndex) => {
        const isSelected = monthIndex === selectedMonthIndex;
        const isCurrent = monthIndex === currentMonthIndex;
        const Icon = MONTH_ICONS[monthIndex];

        return (
          <button
            key={label}
            type="button"
            className={styles.month}
            data-selected={isSelected}
            data-current={isCurrent}
            aria-pressed={isSelected}
            aria-current={isCurrent ? 'date' : undefined}
            onClick={() => onSelect(monthIndex)}
          >
            <span className={styles.icon} aria-hidden="true">
              <Icon />
            </span>
            <span className={styles.label}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}