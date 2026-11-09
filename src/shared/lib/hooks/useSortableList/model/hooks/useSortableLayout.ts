import { useCallback } from 'react';
import type { RefObject } from 'react';
import { moveItem } from '@/shared/lib/utils/moveItem';
import {
  measureItems,
  readRowGap,
  resetItemStyles,
  setTranslate,
} from '../../lib/sortableDom';
import {
  clampGrabOffset,
  computeLayoutShifts,
  findTargetIndex,
} from '../../lib/sortableGeometry';
import { SHIFT_TRANSITION } from '../constants';
import type { DragSession, ItemRect } from '../types';

interface UseSortableLayoutOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  items: RefObject<Map<string, HTMLElement>>;
  latest: RefObject<{ ids: readonly string[] }>;
}

const shiftsFor = (
  container: HTMLElement,
  rects: readonly ItemRect[],
  from: number,
  to: number,
): Map<string, number> =>
  computeLayoutShifts(
    rects,
    moveItem(
      rects.map((rect) => rect.id),
      from,
      to,
    ),
    readRowGap(container),
  );

const applyShifts = (
  items: ReadonlyMap<string, HTMLElement>,
  shifts: ReadonlyMap<string, number>,
  skipId: string,
): void => {
  items.forEach((element, id) => {
    if (id !== skipId) setTranslate(element, shifts.get(id) ?? 0);
  });
};

export function useSortableLayout({ containerRef, items, latest }: UseSortableLayoutOptions) {
  const begin = useCallback(
    (id: string, reducedMotion: boolean) => {
      const dragged = items.current.get(id);
      if (!dragged) return;

      dragged.dataset.dragged = 'true';
      dragged.style.transition = 'none';
      items.current.forEach((element, itemId) => {
        if (itemId !== id) element.style.transition = reducedMotion ? 'none' : SHIFT_TRANSITION;
      });
    },
    [items],
  );

  const applyDrag = useCallback(
    (drag: DragSession) => {
      const container = containerRef.current;
      const dragged = items.current.get(drag.id);
      if (!container || !dragged) return;

      const rects = measureItems(latest.current.ids, items.current);
      const grabOffset = clampGrabOffset(drag.grabOffset, dragged.offsetHeight);
      const top = drag.pointerY - container.getBoundingClientRect().top - grabOffset;
      setTranslate(dragged, top - dragged.offsetTop);

      drag.targetIndex = findTargetIndex(rects, drag.id, top + dragged.offsetHeight / 2);
      applyShifts(
        items.current,
        shiftsFor(container, rects, drag.fromIndex, drag.targetIndex),
        drag.id,
      );
    },
    [containerRef, items, latest],

  );

  const applyDrop = useCallback(
    (drag: DragSession, finalIndex: number): boolean => {
      const container = containerRef.current;
      const dragged = items.current.get(drag.id);
      if (!container || !dragged) return false;

      const rects = measureItems(latest.current.ids, items.current);
      const shifts = shiftsFor(container, rects, drag.fromIndex, finalIndex);
      applyShifts(items.current, shifts, drag.id);

      dragged.style.transition = drag.reducedMotion ? 'none' : SHIFT_TRANSITION;
      setTranslate(dragged, shifts.get(drag.id) ?? 0);
      return true;
    },
    [containerRef, items, latest],
  );

  const reset = useCallback(() => {
    resetItemStyles(items.current.values());
  }, [items]);

  return { begin, applyDrag, applyDrop, reset };
}