import { useState } from 'react';
import type { PeriodScale } from '@/entities/period';
import { AppsIcon } from '@/shared/ui/icons';
import { ALL_PERIODS_LABELS } from '../../model/constants/allPeriods';
import type { DotsProgressStore } from '../../model/lib/dotsProgress';
import type { PeriodCarouselItem } from '../../model/types/periodItem';
import { AllPeriodsScreen } from '../AllPeriodsScreen';
import { PeriodDots } from '../PeriodDots';
import styles from './PeriodDotsSwitch.module.css';

interface PeriodDotsSwitchProps {
  items: readonly PeriodCarouselItem[];
  index: number;
  scale: PeriodScale;
  isIdle: boolean;
  live: DotsProgressStore;
  onSelect: (index: number) => void;
}

export function PeriodDotsSwitch({
  items,
  index,
  scale,
  isIdle,
  live,
  onSelect,
}: PeriodDotsSwitchProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const title = ALL_PERIODS_LABELS[scale];

  const handleSelect = (position: number) => {
    onSelect(position);
    setIsSheetOpen(false);
  };

  return (
    <>
      {isIdle ? (
        <button
          type="button"
          className={styles.all}
          data-all-periods=""
          aria-haspopup="dialog"
          onClick={() => setIsSheetOpen(true)}
        >
          <AppsIcon width={14} height={14} />
          <span>{title}</span>
        </button>
      ) : (
        <PeriodDots count={items.length} index={index} live={live} onSelect={onSelect} />
      )}
      <AllPeriodsScreen
        isOpen={isSheetOpen}
        title={title}
        items={items}
        activeIndex={index}
        onSelect={handleSelect}
        onClose={() => setIsSheetOpen(false)}
      />
    </>
  );
}