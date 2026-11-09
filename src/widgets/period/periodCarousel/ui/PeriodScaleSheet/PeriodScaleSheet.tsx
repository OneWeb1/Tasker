import { PERIOD_SCALES } from '@/entities/period';
import type { PeriodScale } from '@/entities/period';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Tabs } from '@/shared/ui/Tabs';
import styles from './PeriodScaleSheet.module.css';

interface PeriodScaleSheetProps {
  isOpen: boolean;
  scale: PeriodScale;
  onChange: (scale: PeriodScale) => void;
  onClose: () => void;
}

export function PeriodScaleSheet({ isOpen, scale, onChange, onClose }: PeriodScaleSheetProps) {
  const handleChange = (next: PeriodScale) => {
    onChange(next);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} title="Проміжок" onClose={onClose}>
      <div className={styles.content}>
        <Tabs
          ariaLabel="Масштаб проміжків"
          variant="pill"
          items={PERIOD_SCALES}
          value={scale}
          onChange={handleChange}
          onReselect={onClose}
        />
      </div>
    </BottomSheet>
  );
}