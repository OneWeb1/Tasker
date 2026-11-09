import type { ItemRect } from '../../model/types';

export const measureItems = (
  ids: readonly string[],
  items: ReadonlyMap<string, HTMLElement>,
): ItemRect[] => {
  const rects: ItemRect[] = [];

  ids.forEach((id) => {
    const element = items.get(id);
    if (element) rects.push({ id, top: element.offsetTop, height: element.offsetHeight });
  });

  return rects;
};

export const readRowGap = (container: HTMLElement): number => {
  const gap = Number.parseFloat(window.getComputedStyle(container).rowGap);
  return Number.isFinite(gap) ? gap : 0;
};

export const setTranslate = (element: HTMLElement, offsetY: number): void => {
  element.style.transform = `translate3d(0, ${offsetY}px, 0)`;
};

export const resetItemStyles = (elements: Iterable<HTMLElement>): void => {
  for (const element of elements) {
    element.style.transform = '';
    element.style.transition = '';
    delete element.dataset.dragged;
  }
};

export const getScrollParent = (element: HTMLElement): HTMLElement | null => {
  let parent = element.parentElement;

  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    const isScrollable = overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';
    if (isScrollable && parent.scrollHeight > parent.clientHeight) return parent;
    parent = parent.parentElement;
  }

  return null;
};

export const getScrollBounds = (
  scrollParent: HTMLElement | null,
): { top: number; bottom: number } => {
  if (!scrollParent) return { top: 0, bottom: window.innerHeight };
  const { top, bottom } = scrollParent.getBoundingClientRect();
  return { top, bottom };
};

export const scrollByDelta = (scrollParent: HTMLElement | null, delta: number): void => {
  if (scrollParent) scrollParent.scrollTop += delta;
  else window.scrollBy(0, delta);
};

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const blockTouchScroll = (isActive: () => boolean): (() => void) => {
  const onTouchMove = (event: TouchEvent) => {
    if (isActive() && event.cancelable) event.preventDefault();
  };

  window.addEventListener('touchmove', onTouchMove, { passive: false });
  return () => window.removeEventListener('touchmove', onTouchMove);
};

export const triggerHaptic = (durationMs: number): void => {
  if ('vibrate' in navigator) navigator.vibrate(durationMs);
};