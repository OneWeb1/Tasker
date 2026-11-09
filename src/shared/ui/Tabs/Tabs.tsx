import { useLayoutEffect, useRef } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { useTabShift } from '@/shared/lib/hooks/useTabShift';
import type { TabShiftStore } from '@/shared/lib/hooks/useTabShift';
import styles from './Tabs.module.css';

interface TabItem<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  count?: number;
  caption?: string;
}

interface TabsProps<T extends string> {
  items: readonly TabItem<T>[];
  value: T;
  ariaLabel: string;
  variant?: 'pill' | 'underline' | 'text' | 'card';
  shiftStore?: TabShiftStore<T>;
  onChange: (value: T) => void;
  onReselect?: (value: T) => void;
}

const getCenterScroll = (list: HTMLElement, tab: HTMLElement): number => {
  const listRect = list.getBoundingClientRect();
  const tabRect = tab.getBoundingClientRect();
  const center = tabRect.left - listRect.left + list.scrollLeft + tabRect.width / 2;
  const target = center - listRect.width / 2;
  return Math.max(0, Math.min(list.scrollWidth - list.clientWidth, target));
};

const findTab = (list: HTMLElement, value: string): HTMLElement | undefined =>
  Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).find(
    (tab) => tab.dataset.value === value,
  );

interface TabGeometry {
  key: string;
  startScroll: number;
  endScroll: number;
  fromLeft: number;
  fromWidth: number;
  fromTop: number;
  fromHeight: number;
  toLeft: number;
  toWidth: number;
}

const resolveGeometry = (
  cache: RefObject<TabGeometry | null>,
  list: HTMLElement,
  value: string,
  shiftTo: string,
): TabGeometry | null => {
  const key = `${value}>${shiftTo}`;
  if (cache.current?.key === key) return cache.current;

  const from = findTab(list, value);
  const to = findTab(list, shiftTo);
  if (!from || !to) return null;

  const geometry: TabGeometry = {
    key,
    startScroll: getCenterScroll(list, from),
    endScroll: getCenterScroll(list, to),
    fromLeft: from.offsetLeft,
    fromWidth: from.offsetWidth,
    fromTop: from.offsetTop,
    fromHeight: from.offsetHeight,
    toLeft: to.offsetLeft,
    toWidth: to.offsetWidth,
  };
  cache.current = geometry;
  return geometry;
};

const getActiveStyle = <T extends string>(
  item: T,
  value: T,
  shift: { to: T; amount: number } | undefined,
): CSSProperties | undefined => {
  if (!shift) return undefined;
  if (item === value) return { '--tab-active': 1 - shift.amount } as CSSProperties;
  if (item === shift.to) return { '--tab-active': shift.amount } as CSSProperties;
  return undefined;
};

export function Tabs<T extends string>({
  items,
  value,
  ariaLabel,
  variant = 'pill',
  shiftStore,
  onChange,
  onReselect,
}: TabsProps<T>) {
  const shift = useTabShift(shiftStore);
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const hasIndicatorPosition = useRef(false);
  const hasCentered = useRef(false);
  const wasShifted = useRef(false);
  const geometryRef = useRef<TabGeometry | null>(null);

  const shiftTo = shift?.to;
  const shiftAmount = shift?.amount;
  const shiftSettling = shift?.isSettling ?? false;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    if (shiftTo === undefined || shiftAmount === undefined) {
      geometryRef.current = null;
      if (!wasShifted.current) return;
      wasShifted.current = false;
      const selected = findTab(list, value);
      if (selected) list.scrollTo({ left: getCenterScroll(list, selected), behavior: 'smooth' });
      return;
    }

    wasShifted.current = true;
    const geometry = resolveGeometry(geometryRef, list, value, shiftTo);
    if (!geometry) return;

    const left = geometry.startScroll + (geometry.endScroll - geometry.startScroll) * shiftAmount;
    if (shiftSettling) list.scrollTo({ left, behavior: 'smooth' });
    else list.scrollLeft = left;
  }, [shiftAmount, shiftSettling, shiftTo, value]);

  useLayoutEffect(() => {
    const list = listRef.current;
    const selected = list?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!list || !selected) return;

    list.scrollTo({
      left: getCenterScroll(list, selected),
      behavior: hasCentered.current ? 'smooth' : 'instant',
    });
    hasCentered.current = true;
  }, [value]);

  useLayoutEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;

    const geometry =
      shiftTo === undefined ? null : resolveGeometry(geometryRef, list, value, shiftTo);

    let left: number;
    let width: number;
    let top: number;
    let height: number;
    if (geometry) {
      const amount = shiftAmount ?? 0;
      left = geometry.fromLeft + (geometry.toLeft - geometry.fromLeft) * amount;
      width = geometry.fromWidth + (geometry.toWidth - geometry.fromWidth) * amount;
      top = geometry.fromTop;
      height = geometry.fromHeight;
    } else {
      const from = findTab(list, value);
      if (!from) return;
      left = from.offsetLeft;
      width = from.offsetWidth;
      top = from.offsetTop;
      height = from.offsetHeight;
    }
    const isDragging = shiftTo !== undefined && !shiftSettling;

    indicator.dataset.animate = String(hasIndicatorPosition.current && !isDragging);
    indicator.style.width = `${width}px`;
    indicator.style.transform = `translateX(${left}px)`;
    if (variant === 'pill' || variant === 'card') {
      indicator.style.top = `${top}px`;
      indicator.style.height = `${height}px`;
    }
    hasIndicatorPosition.current = true;
  }, [items, shiftAmount, shiftSettling, shiftTo, value, variant]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className={styles.tabs}
      data-variant={variant}
    >
      <span ref={indicatorRef} className={styles.indicator} aria-hidden="true" />
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          data-value={item.value}
          aria-selected={item.value === value}
          className={styles.tab}
          style={getActiveStyle(item.value, value, shift)}
          onClick={() => (item.value === value ? onReselect?.(item.value) : onChange(item.value))}
        >
          {item.icon && (
            <span className={styles.icon} aria-hidden="true">
              {item.icon}
            </span>
          )}
          <span className={styles.title}>
            <span className={styles.label}>{item.label}</span>
            {item.count !== undefined && <span className={styles.count}>{item.count}</span>}
          </span>
          {item.caption && <span className={styles.caption}>{item.caption}</span>}
        </button>
      ))}
    </div>
  );
}