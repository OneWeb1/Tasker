import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { getPeriodStyle } from '@/entities/period';
import { SlideScreen } from '@/shared/ui/SlideScreen';
import { PERIOD_SCREEN_BACKDROP } from '../../model/constants/screenBackdrop';
import type { PeriodCarouselItem } from '../../model/types/periodItem';
import styles from './AllPeriodsScreen.module.css';
import { PeriodTile } from './PeriodTile';

interface AllPeriodsScreenProps {
  isOpen: boolean;
  title: string;
  items: readonly PeriodCarouselItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export function AllPeriodsScreen({
  isOpen,
  title,
  items,
  activeIndex,
  onSelect,
  onClose,
}: AllPeriodsScreenProps) {
  const active = items[activeIndex];
  const surfaceStyle = {
    ...(active ? getPeriodStyle(active.period) : null),
    '--screen-bg': PERIOD_SCREEN_BACKDROP,
  } as CSSProperties;

  return createPortal(
    <SlideScreen
      isOpen={isOpen}
      title={title}
      isHeaderPlain
      isTitleLarge
      surfaceStyle={surfaceStyle}
      onClose={onClose}
    >
      <ul className={styles.grid}>
        {items.map((item, position) => (
          <li key={item.period.id} className={styles.cell}>
            <PeriodTile
              item={item}
              isActive={position === activeIndex}
              onSelect={() => onSelect(position)}
            />
          </li>
        ))}
      </ul>
    </SlideScreen>,
    document.body,
  );
}