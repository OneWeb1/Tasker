import { memo } from 'react';
import type { ReactNode } from 'react';
import { getPeriodStyle, pluralizeDays } from '@/entities/period';
import type { PeriodScale } from '@/entities/period';
import type { useHorizontalSwipe } from '@/shared/lib/hooks/useHorizontalSwipe';
import { AnimatedNumber } from '@/shared/ui/AnimatedNumber';
import type { PeriodCarouselItem } from '../../model/types/periodItem';
import { PeriodHeader } from '../PeriodHeader';
import styles from './PeriodPage.module.css';
import { PeriodSlide } from './PeriodSlide';

interface PeriodPageSwipe {
  ref: (element: HTMLDivElement | null) => void;
  handlers: ReturnType<typeof useHorizontalSwipe>['handlers'];
}

interface PeriodPageProps {
  item: PeriodCarouselItem;
  scale: PeriodScale;
  swipe?: PeriodPageSwipe;
  dots: ReactNode;
  content: ReactNode;
  onScaleChange: (scale: PeriodScale) => void;
  onToday: () => void;
  onOpenDetails?: () => void;
}

export const PeriodPage = memo(function PeriodPage({
  item,
  scale,
  swipe,
  dots,
  content,
  onScaleChange,
  onToday,
  onOpenDetails,
}: PeriodPageProps) {
  const { period, progress, label, isCurrent } = item;

  return (
    <div
      ref={swipe?.ref}
      className={styles.page}
      data-horizontal-swipe={swipe ? true : undefined}
      {...swipe?.handlers}
    >
      <section className={styles.root} style={getPeriodStyle(period)} aria-label="Проміжки часу">
        <PeriodHeader
          label={label}
          scale={scale}
          isCurrent={isCurrent}
          onScaleChange={onScaleChange}
          onToday={onToday}
        />

        <div className={styles.summary} aria-live="polite">
          {progress.status === 'finished' ? (
            <span className={styles.heading}>Завершено</span>
          ) : (
            <>
              <span className={styles.value}>
                <AnimatedNumber key={period.id} value={progress.daysLeft} />
              </span>
              <span className={styles.unit}>{pluralizeDays(progress.daysLeft)} до завершення</span>
            </>
          )}
        </div>

        <div className={styles.viewport}>
          <div className={styles.area} data-period-lead="">
            <div className={styles.track}>
              <PeriodSlide item={item} onOpen={onOpenDetails} />
            </div>
          </div>
        </div>

        <div className={styles.actions} data-period-fixed="">
          {dots}
        </div>
      </section>
      <div key={period.id} className={styles.content}>
        {content}
      </div>
    </div>

  );
});