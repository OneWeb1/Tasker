import { AUTOSCROLL_EDGE, AUTOSCROLL_MAX_SPEED } from '../../model/constants';
import { findScrollParent } from '../scrollParent';

const readDelta = (y: number, top: number, bottom: number): number => {
  if (y < top + AUTOSCROLL_EDGE) {
    return -AUTOSCROLL_MAX_SPEED * Math.min(1, (top + AUTOSCROLL_EDGE - y) / AUTOSCROLL_EDGE);
  }
  if (y > bottom - AUTOSCROLL_EDGE) {
    return AUTOSCROLL_MAX_SPEED * Math.min(1, (y - (bottom - AUTOSCROLL_EDGE)) / AUTOSCROLL_EDGE);
  }
  return 0;
};

export const autoScrollAtEdge = (root: HTMLElement | null, y: number): void => {
  const scroller = findScrollParent(root);
  if (!scroller) return;

  const rect = scroller.getBoundingClientRect();
  const delta = readDelta(y, Math.max(rect.top, 0), Math.min(rect.bottom, window.innerHeight));
  if (delta !== 0) scroller.scrollTop += delta;
};