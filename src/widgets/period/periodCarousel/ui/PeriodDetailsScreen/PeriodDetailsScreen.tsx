import type { CSSProperties } from 'react';
import { PeriodCard, getPeriodStyle } from '@/entities/period';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { PERIOD_SCREEN_BACKDROP } from '../../model/constants/screenBackdrop';
import type { PeriodCarouselItem } from '../../model/types/periodItem';
import { PeriodDetailsContent } from './PeriodDetailsContent';
import styles from './PeriodDetailsScreen.module.css';

interface PeriodDetailsScreenProps {
  isOpen: boolean;
  item: PeriodCarouselItem;
  isScrollLocked: boolean;
  onClose: () => void;
}

export function PeriodDetailsScreen({
  isOpen,
  item,
  isScrollLocked,
  onClose,
}: PeriodDetailsScreenProps) {
  const surfaceStyle = {
    ...getPeriodStyle(item.period),
    '--screen-bg': PERIOD_SCREEN_BACKDROP,
  } as CSSProperties;

  return (
    <SlideScreen
      isOpen={isOpen}
      title={item.label}
      isHeaderPlain
      isTitleLarge
      isTitleHidden
      isScrollLocked={isScrollLocked}
      surfaceStyle={surfaceStyle}
      onClose={onClose}
    >
      <div className={styles.content}>
        <PeriodCard period={item.period} progress={item.progress} percent={item.completion} isFlat />
        <PeriodDetailsContent item={item} />
      </div>
    </SlideScreen>
  );
}