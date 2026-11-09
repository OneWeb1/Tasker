export const VISIBLE_DOTS = 4;
export const SLOT_WIDTH = 16;
export const INDICATOR_SIZE = 8;
export const VIEWPORT_OVERFLOW = 5;

const EDGE_SCALE = 0.75;

interface BlobLayout {
  x: number;
  opacity: number;
}

export interface DotsLayout {
  visible: number;
  liveStart: number;
  trackX: number;
  current: BlobLayout;
  next: BlobLayout;
}

export interface DotsWindow {
  visible: number;
  start: number;
  end: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const getBlobOffset = (position: number): number =>
  position * SLOT_WIDTH + (SLOT_WIDTH - INDICATOR_SIZE) / 2;

export const getVisibleDots = (count: number): number => Math.min(count, VISIBLE_DOTS);

export const getDotsWindow = (count: number, index: number): DotsWindow => {
  const visible = getVisibleDots(count);
  const start = clamp(index - 1, 0, count - visible);
  return { visible, start, end: start + visible - 1 };
};

export const getDotsLayout = (count: number, index: number, progress: number): DotsLayout => {
  const visible = getVisibleDots(count);
  const liveIndex = clamp(index + progress, 0, count - 1);
  const liveStart = clamp(liveIndex - 1, 0, count - visible);
  const swipeAmount = Math.abs(liveIndex - index);
  const nextIndex = clamp(index + (liveIndex < index ? -1 : 1), 0, count - 1);

  return {
    visible,
    liveStart,
    trackX: -liveStart * SLOT_WIDTH,
    current: { x: getBlobOffset(liveIndex), opacity: 1 - swipeAmount },
    next: { x: getBlobOffset(nextIndex), opacity: swipeAmount },
  };
};

export const getDotScale = (
  position: number,
  liveStart: number,
  count: number,
  visible: number,
): number => {
  const relative = position - liveStart;
  const leftEdge = position > 0 ? EDGE_SCALE : 1;
  const rightEdge = position < count - 1 ? EDGE_SCALE : 1;

  if (relative <= -1 || relative >= visible) return 0;
  if (relative < 0) return leftEdge * (1 + relative);
  if (relative < 1) return leftEdge + (1 - leftEdge) * relative;
  if (relative <= visible - 2) return 1;
  if (relative <= visible - 1) return 1 - (1 - rightEdge) * (relative - (visible - 2));
  return rightEdge * (visible - relative);
};