import type { SelectionGeometry } from '../../model/types';

export const readSelectionGeometry = (range: Range, isAStart: boolean): SelectionGeometry => {
  const box = range.getBoundingClientRect();
  const rects = Array.from(range.getClientRects()).filter(
    (rect) => rect.width > 0 || rect.height > 0,
  );
  const first = rects[0] ?? box;
  const last = rects[rects.length - 1] ?? first;
  const start = { x: first.left, y: first.bottom };
  const end = { x: last.right, y: last.bottom };

  return {
    top: box.top,
    bottom: box.bottom,
    left: box.left,
    right: box.right,
    handles: isAStart ? { a: start, b: end } : { a: end, b: start },
  };
};