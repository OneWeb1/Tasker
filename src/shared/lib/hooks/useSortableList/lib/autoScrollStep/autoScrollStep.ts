import { AUTO_SCROLL_EDGE_PX, AUTO_SCROLL_MAX_SPEED_PX } from '../../model/constants';
import { getScrollBounds, scrollByDelta } from '../sortableDom';
import { computeAutoScrollDelta } from '../sortableGeometry';

export const autoScrollStep = (scrollParent: HTMLElement | null, pointerY: number): void => {
  const { top, bottom } = getScrollBounds(scrollParent);
  const delta = computeAutoScrollDelta(
    pointerY,
    top,
    bottom,
    AUTO_SCROLL_EDGE_PX,
    AUTO_SCROLL_MAX_SPEED_PX,
  );
  if (delta !== 0) scrollByDelta(scrollParent, delta);
};