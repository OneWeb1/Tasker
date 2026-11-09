import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useHorizontalSwipe } from '@/shared/lib/hooks/useHorizontalSwipe';
import type { TabShiftStore } from '@/shared/lib/hooks/useTabShift';
import { useTabMotion } from './model/useTabMotion';
import styles from './TabPanel.module.css';

const SWIPE_GAP = 16;

export type { TabShift } from '@/shared/lib/hooks/useTabShift';

const getScroller = (element: HTMLElement | null): HTMLElement | null => {
  let node = element?.parentElement ?? null;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return null;
};

interface TabSwipe<T extends string> {
  onChange: (value: T) => void;
  renderPanel: (value: T) => ReactNode;
  shiftStore?: TabShiftStore<T>;
}

interface TabPanelProps<T extends string> {
  value: T;
  order: readonly T[];
  swipe?: TabSwipe<T>;
  children: ReactNode;
}

export function TabPanel<T extends string>({ value, order, swipe, children }: TabPanelProps<T>) {
  const { motion, clearMotion, skipNextMotion } = useTabMotion(value, order);
  const swipeRef = useRef<HTMLDivElement>(null);
  const neighborRef = useRef<HTMLDivElement>(null);
  const shownValue = useRef(value);

  useLayoutEffect(() => {
    if (shownValue.current === value) return;
    shownValue.current = value;
    const scroller = getScroller(swipeRef.current);
    if (scroller) scroller.scrollTo({ top: 0, behavior: 'instant' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [value]);

  const index = order.indexOf(value);
  const previous = order[index - 1];
  const next = order[index + 1];

  const go = (target: T | undefined) => {
    if (!swipe || target === undefined) return;
    skipNextMotion();
    swipe.onChange(target);
  };

  const gesture = useHorizontalSwipe({
    onSwipeLeft: () => go(next),
    onSwipeRight: () => go(previous),
    canSwipeLeft: next !== undefined,
    canSwipeRight: previous !== undefined,
    gap: SWIPE_GAP,
    targetRef: swipeRef,
    onProgress: ({ direction, progress, isSettling }) => {
      const to = direction === 0 ? undefined : direction < 0 ? next : previous;
      swipe?.shiftStore?.set(to === undefined ? undefined : { to, amount: progress, isSettling });
    },
  });

  const isSwiping = swipe !== undefined && gesture.direction !== 0;
  const neighbor = isSwiping ? (gesture.direction < 0 ? next : previous) : undefined;
  const side = gesture.direction < 0 ? 'next' : 'prev';

  useLayoutEffect(() => {
    const box = swipeRef.current;
    const element = neighborRef.current;
    if (!box || !element) return;
    const scroller = getScroller(box);
    const scrollerRect = scroller?.getBoundingClientRect();
    const viewTop = scrollerRect?.top ?? 0;
    const viewBottom = scrollerRect?.bottom ?? window.innerHeight;
    const boxTop = box.getBoundingClientRect().top;
    const tabsBottom =
      box.parentElement?.previousElementSibling?.getBoundingClientRect().bottom ?? viewTop;
    const visibleTop = Math.max(boxTop, viewTop, tabsBottom);
    element.style.top = `${visibleTop - boxTop}px`;
    element.style.minHeight = `${Math.max(viewBottom - visibleTop, 0)}px`;
  }, [neighbor]);

  const renderPanel = swipe?.renderPanel;
  const neighborPanel = useMemo(
    () => (neighbor !== undefined && renderPanel ? renderPanel(neighbor) : null),
    [neighbor, renderPanel],
  );

  const shiftStore = swipe?.shiftStore;

  useEffect(() => () => shiftStore?.set(undefined), [shiftStore]);

  const panel = (
    <div
      key={value}
      className={styles.panel}
      data-motion={motion ?? undefined}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) clearMotion();
      }}
    >
      {children}
    </div>
  );

  return (
    <div
      className={styles.viewport}
      data-moving={motion !== null || isSwiping || gesture.isDragging || gesture.isSettling}
    >
      {swipe ? (
        <div
          ref={swipeRef}
          className={styles.swipe}
          data-settling={gesture.isSettling}
          style={
            { '--swipe-gap': `${SWIPE_GAP}px` } as CSSProperties
          }
          onTransitionEnd={gesture.onTransitionEnd}
          {...gesture.handlers}
        >
          {panel}
          {neighbor !== undefined && (
            <div
              key={neighbor}
              ref={neighborRef}
              className={styles.neighbor}
              data-side={side}
              aria-hidden="true"
            >
              {neighborPanel}
            </div>
          )}
        </div>
      ) : (
        panel
      )}
    </div>
  );
}