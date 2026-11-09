import { memo } from 'react';
import { PeriodCard } from '@/entities/period';
import type { PeriodCarouselItem } from '../../model/types/periodItem';
import styles from './PeriodPage.module.css';

interface PeriodSlideProps {
  item: PeriodCarouselItem;
  onOpen?: () => void;
}

export const PeriodSlide = memo(function PeriodSlide({ item, onOpen }: PeriodSlideProps) {
  return (
    <div className={styles.slide} data-period-slide="">
      <PeriodCard period={item.period} progress={item.progress} percent={item.completion} />
      {onOpen && (
        <button type="button" className={styles.open} aria-label="Деталі проміжку" onClick={onOpen} />
      )}
    </div>
  );
});