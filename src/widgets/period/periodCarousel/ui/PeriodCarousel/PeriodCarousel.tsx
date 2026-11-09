import {
  memo,
  useCallback,
  useDeferredValue,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import { useElementWidth } from '@/shared/lib/hooks/useElementWidth';
import { useHorizontalSwipe } from '@/shared/lib/hooks/useHorizontalSwipe';
import { DOTS_IDLE_DELAY_MS } from '../../model/constants/allPeriods';
import {
  PERIOD_DOTS_WAKE_DISTANCE_PX,
  PERIOD_SETTLE_EASING,
  PERIOD_SETTLE_MS,
} from '../../model/constants/motion';
import { useDotsIdle } from '../../model/hooks/useDotsIdle';
import { usePeriodCarousel } from '../../model/hooks/usePeriodCarousel';
import { usePeriodScreen } from '../../model/hooks/usePeriodScreen';
import { REST_FRAME, invalidateCarouselLayers, paintCarousel } from '../../model/lib/carouselView';
import { createDotsProgressStore } from '../../model/lib/dotsProgress';
import type { PeriodSelection } from '../../model/types/periodSelection';
import { PeriodDots } from '../PeriodDots';

import { PeriodDotsSwitch } from '../PeriodDotsSwitch';
import { PeriodPage } from '../PeriodPage';
import styles from './PeriodCarousel.module.css';

const noop = () => undefined;

const CONTENT_CACHE_LIMIT = 4;

interface PeriodCarouselProps {
  onActiveChange?: (selection: PeriodSelection) => void;
  renderContent: (selection: PeriodSelection) => ReactNode;
}

export const PeriodCarousel = memo(function PeriodCarousel({
  onActiveChange,
  renderContent,
}: PeriodCarouselProps) {
  const { scale, changeScale, items, index, goToToday, select, selectionAt, neighborAt } =
    usePeriodCarousel(onActiveChange);

  const stage = useElementWidth<HTMLDivElement>();
  const viewport = useElementWidth<HTMLDivElement>();
  const neighborViewport = useElementWidth<HTMLDivElement>();
  const gap = Math.max(stage.width - viewport.width, 0);

  const shiftRef = useRef<HTMLDivElement>(null);
  const stageWidthRef = useRef(0);
  const frameRef = useRef(REST_FRAME);
  const [dotsStore] = useState(createDotsProgressStore);
  const { open: openPeriodScreen } = usePeriodScreen();
  const { isIdle: areDotsIdle, wake: wakeDots } = useDotsIdle(dotsStore, DOTS_IDLE_DELAY_MS);

  const handlePointerDownCapture = (event: PointerEvent<HTMLDivElement>) => {
    const { target } = event;
    if (!(target instanceof Element) || !event.currentTarget.contains(target)) return;
    if (target.closest('[data-all-periods]')) return;
    if (!areDotsIdle) wakeDots();
  };

  const { direction, isDragging, isSettling, handlers, onTransitionEnd } = useHorizontalSwipe({
    onSwipeLeft: () => select(index + 1),
    onSwipeRight: () => select(index - 1),
    canSwipeLeft: neighborAt(index + 1) !== null,
    canSwipeRight: neighborAt(index - 1) !== null,
    gap,
    settleDuration: PERIOD_SETTLE_MS,
    targetRef: shiftRef,
    onProgress: ({ direction: dir, progress, isSettling: settling }) => {
      const signed = dir * progress;
      const frame = { progress: signed, width: stageWidthRef.current, isSettling: settling };
      frameRef.current = frame;
      if (shiftRef.current) paintCarousel(shiftRef.current, frame);
      if (
        dir !== 0 &&
        !settling &&
        progress * stageWidthRef.current > PERIOD_DOTS_WAKE_DISTANCE_PX
      ) {
        wakeDots();
      }
      dotsStore.set({
        progress: -signed,
        isDragging: dir !== 0 && !settling,
        isSettling: settling,
      });
    },
  });

  const [side, setSide] = useState(0);
  const isIdle = direction === 0 && !isDragging && !isSettling;
  if (direction !== 0 && side !== direction) setSide(direction);
  else if (isIdle && side !== 0) setSide(0);

  const candidate = side === 0 ? null : index + (side < 0 ? 1 : -1);
  const deferredCandidate = useDeferredValue(candidate);
  const neighbor = candidate === null ? null : neighborAt(candidate);
  const currentItem = items[index];
  const openDetails = useCallback(() => {
    if (currentItem) openPeriodScreen(currentItem);
  }, [currentItem, openPeriodScreen]);
  const neighborItem = neighbor?.item;
  const neighborIndex = neighbor?.index ?? null;
  const neighborCount = neighbor?.count ?? 0;

  useLayoutEffect(() => {
    stageWidthRef.current = stage.width;
  }, [stage.width]);

  useLayoutEffect(() => {
    const shift = shiftRef.current;
    if (!shift) return;
    invalidateCarouselLayers(shift);
    paintCarousel(shift, frameRef.current);
  });

  const contentCache = useMemo(() => new Map<string, ReactNode>(), [renderContent]);

  const contentAt = useCallback(
    (position: number): ReactNode => {
      const selection = selectionAt(position);
      if (!selection) return null;

      const key = `${selection.from}|${selection.to}|${selection.label}`;
      const cached = contentCache.get(key);
      if (cached !== undefined) {
        contentCache.delete(key);
        contentCache.set(key, cached);
        return cached;
      }

      const element = renderContent(selection);
      contentCache.set(key, element);
      if (contentCache.size > CONTENT_CACHE_LIMIT) {
        const oldest = contentCache.keys().next().value;
        if (oldest !== undefined) contentCache.delete(oldest);
      }
      return element;
    },
    [contentCache, renderContent, selectionAt],
  );

  const content = useMemo(() => contentAt(index), [contentAt, index]);

  const neighborContent = useMemo(() => {
    if (candidate === null || deferredCandidate !== candidate) return null;
    return contentAt(candidate);
  }, [candidate, contentAt, deferredCandidate]);

  const neighborDots = useMemo(
    () =>
      neighborIndex === null ? null : (
        <PeriodDots count={neighborCount} index={neighborIndex} onSelect={noop} />
      ),
    [neighborCount, neighborIndex],
  );

  return (
    <div
      ref={stage.ref}
      className={styles.stage}
      onPointerDownCapture={handlePointerDownCapture}
      style={
        {
          '--page-gap': `${gap}px`,
          '--settle-duration': `${PERIOD_SETTLE_MS}ms`,
          '--settle-easing': PERIOD_SETTLE_EASING,
        } as CSSProperties
      }
    >
      <div ref={shiftRef} className={styles.shift} onTransitionEnd={onTransitionEnd}>
        {currentItem && (
          <div key={currentItem.period.id} className={styles.slot} data-role="current">
            <PeriodPage
              item={currentItem}
              scale={scale}
              swipe={{ ref: viewport.ref, handlers }}
              dots={
                <PeriodDotsSwitch
                  items={items}
                  index={index}
                  scale={scale}
                  isIdle={areDotsIdle}
                  live={dotsStore}
                  onSelect={select}
                />
              }
              content={content}
              onScaleChange={changeScale}
              onToday={goToToday}
              onOpenDetails={openDetails}
            />
          </div>
        )}
        {neighborItem && neighborIndex !== null && (
          <div
            key={neighborItem.period.id}
            className={styles.slot}
            data-role="neighbor"
            data-side={side < 0 ? 'next' : 'prev'}
            aria-hidden="true"
          >
            <PeriodPage
              item={neighborItem}
              scale={scale}
              swipe={{ ref: neighborViewport.ref, handlers }}
              dots={neighborDots}
              content={neighborContent}
              onScaleChange={noop}
              onToday={noop}
            />
          </div>
        )}
      </div>

    </div>
  );
});