import { useState } from 'react';
import type { PeriodScale } from '@/entities/period';
import { ChevronDownIcon } from '@/shared/ui/icons';
import { PeriodScaleSheet } from '../PeriodScaleSheet';
import styles from './PeriodHeader.module.css';

interface PeriodHeaderProps {
  label: string;
  scale: PeriodScale;
  isCurrent: boolean;
  onScaleChange: (scale: PeriodScale) => void;
  onToday: () => void;
}

export function PeriodHeader({
  label,
  scale,
  isCurrent,
  onScaleChange,
  onToday,
}: PeriodHeaderProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className={styles.header}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-label={`${label}. Обрати проміжок`}
        onClick={() => setIsSheetOpen(true)}
      >
        <span className={styles.label}>{label}</span>
        <ChevronDownIcon width={20} height={20} />
      </button>
      {!isCurrent && (
        <button type="button" className={styles.today} onClick={onToday}>
          Сьогодні
        </button>
      )}
      <PeriodScaleSheet
        isOpen={isSheetOpen}
        scale={scale}
        onChange={onScaleChange}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}