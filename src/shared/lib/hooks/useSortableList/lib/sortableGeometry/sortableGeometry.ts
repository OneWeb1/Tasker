import type { ItemRect } from '../../model/types';

export const clampGrabOffset = (grabOffset: number, itemHeight: number): number =>
  Math.min(Math.max(grabOffset, 0), itemHeight);

export const findTargetIndex = (
  rects: readonly ItemRect[],
  draggedId: string,
  draggedCenterY: number,
): number =>
  rects.reduce(
    (index, rect) =>
      rect.id !== draggedId && rect.top + rect.height / 2 < draggedCenterY ? index + 1 : index,
    0,
  );

export const computeLayoutShifts = (
  rects: readonly ItemRect[],
  order: readonly string[],
  gap: number,
): Map<string, number> => {
  const rectById = new Map(rects.map((rect) => [rect.id, rect]));
  const shifts = new Map<string, number>();
  let nextTop = rects[0]?.top ?? 0;

  order.forEach((id) => {
    const rect = rectById.get(id);
    if (!rect) return;
    shifts.set(id, nextTop - rect.top);
    nextTop += rect.height + gap;
  });

  return shifts;
};

export const computeAutoScrollDelta = (
  pointerY: number,
  boundsTop: number,
  boundsBottom: number,
  edge: number,
  maxSpeed: number,
): number => {
  if (edge <= 0) return 0;

  const topLimit = boundsTop + edge;
  if (pointerY < topLimit) {
    return -Math.round(maxSpeed * Math.min(1, (topLimit - pointerY) / edge));
  }

  const bottomLimit = boundsBottom - edge;
  if (pointerY > bottomLimit) {
    return Math.round(maxSpeed * Math.min(1, (pointerY - bottomLimit) / edge));
  }

  return 0;
};