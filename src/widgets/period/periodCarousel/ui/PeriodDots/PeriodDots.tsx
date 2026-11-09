import { useId, useLayoutEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import {
  INDICATOR_SIZE,
  SLOT_WIDTH,
  VIEWPORT_OVERFLOW,
  getDotScale,
  getDotsLayout,
  getDotsWindow,
} from '../../model/lib/dotsLayout';
import { IDLE_DOTS_STORE } from '../../model/lib/dotsProgress';
import type { DotsProgressStore } from '../../model/lib/dotsProgress';
import styles from './PeriodDots.module.css';

interface PeriodDotsProps {
  count: number;
  index: number;
  live?: DotsProgressStore;
  onSelect: (index: number) => void;
}

const setFlag = (element: HTMLElement, name: 'dragging' | 'settling', value: boolean): void => {
  const next = String(value);
  if (element.dataset[name] !== next) element.dataset[name] = next;
};

export function PeriodDots({ count, index, live = IDLE_DOTS_STORE, onSelect }: PeriodDotsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const gooRef = useRef<HTMLDivElement>(null);
  const currentBlobRef = useRef<HTMLSpanElement>(null);
  const nextBlobRef = useRef<HTMLSpanElement>(null);
  const dotRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isReadyRef = useRef(false);
  const gooId = `period-goo-${useId().replace(/:/g, '')}`;
  const { visible, start, end } = getDotsWindow(count, index);

  useLayoutEffect(() => {
    const paint = () => {
      const track = trackRef.current;
      const goo = gooRef.current;
      const currentBlob = currentBlobRef.current;
      const nextBlob = nextBlobRef.current;
      if (!track || !goo || !currentBlob || !nextBlob) return;

      const { progress, isDragging, isSettling } = live.get();
      const layout = getDotsLayout(count, index, progress);

      track.style.transform = `translate3d(${layout.trackX}px, 0, 0)`;
      setFlag(track, 'dragging', isDragging || !isReadyRef.current);
      setFlag(goo, 'settling', isSettling && isReadyRef.current);

      currentBlob.style.opacity = String(layout.current.opacity);
      currentBlob.style.transform = `translate3d(${layout.current.x}px, 0, 0)`;
      nextBlob.style.opacity = String(layout.next.opacity);
      nextBlob.style.transform = `translate3d(${layout.next.x}px, 0, 0)`;

      for (let position = 0; position < count; position += 1) {
        dotRefs.current[position]?.style.setProperty(
          '--dot-scale',
          String(getDotScale(position, layout.liveStart, count, layout.visible)),
        );
      }
    };

    paint();

    let frame = 0;
    if (!isReadyRef.current) {
      frame = window.requestAnimationFrame(() => {
        frame = window.requestAnimationFrame(() => {
          isReadyRef.current = true;
          paint();
        });
      });
    }

    const unsubscribe = live.subscribe(paint);
    return () => {
      window.cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, [count, index, live]);

  return (
    <div className={styles.dots}>
      <svg className={styles.defs} aria-hidden="true" focusable="false">
        <filter id={gooId} x="-20%" y="-100%" width="140%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feColorMatrix
            in="blur"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
          />
        </filter>
      </svg>
      <div
        className={styles.viewport}
        style={
          {
            width: visible * SLOT_WIDTH + VIEWPORT_OVERFLOW * 2,
            '--viewport-overflow': `${VIEWPORT_OVERFLOW}px`,
          } as CSSProperties
        }
      >
        <div ref={trackRef} className={styles.track}>
          <div
            ref={gooRef}
            className={styles.goo}
            style={{ filter: `url(#${gooId})` }}
            aria-hidden="true"
          >
            <span
              ref={currentBlobRef}
              className={styles.blob}
              style={{ width: INDICATOR_SIZE, height: INDICATOR_SIZE }}
            />
            <span
              ref={nextBlobRef}
              className={styles.blob}
              style={{ width: INDICATOR_SIZE, height: INDICATOR_SIZE }}
            />
          </div>
          {Array.from({ length: count }, (_, position) => {
            const isOutside = position < start || position > end;

            return (
              <button
                key={position}
                ref={(node) => {
                  dotRefs.current[position] = node;
                }}
                type="button"
                className={styles.dot}
                data-active={position === index}
                aria-label={`Проміжок ${position + 1}`}
                aria-current={position === index || undefined}
                tabIndex={isOutside ? -1 : undefined}
                onClick={() => onSelect(position)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}