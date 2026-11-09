const BASE_HEIGHT = 56;
const HEIGHT_PER_MINUTE = 0.6;
const MAX_SCALED_MINUTES = 180;

export const getEntryMinHeight = (start: number, end: number): number =>
  BASE_HEIGHT + Math.min(Math.max(0, end - start), MAX_SCALED_MINUTES) * HEIGHT_PER_MINUTE;