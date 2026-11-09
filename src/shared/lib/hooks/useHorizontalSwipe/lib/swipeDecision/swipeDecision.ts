import {
  AXIS_LOCK_DISTANCE,
  FLICK_VELOCITY,
  MIN_FLICK_DISTANCE,
} from '../../model/constants';
import type { SwipeDirection } from '../../model/types';

export type AxisLock = 'pending' | 'x' | 'y';

interface OffsetInput {
  deltaX: number;
  width: number;
  canSwipeLeft: boolean;
  canSwipeRight: boolean;
  edgeResistance: number;
}

interface ReleaseInput {
  offset: number;
  velocity: number;
  width: number;
  distanceRatio: number;
  canSwipeLeft: boolean;
  canSwipeRight: boolean;
}

const clampSymmetric = (value: number, limit: number): number =>
  Math.max(-limit, Math.min(limit, value));

export const lockAxis = (deltaX: number, deltaY: number): AxisLock => {
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < AXIS_LOCK_DISTANCE) return 'pending';
  return Math.abs(deltaX) * 1.3 > Math.abs(deltaY) ? 'x' : 'y';
};

export const resolveOffset = ({
  deltaX,
  width,
  canSwipeLeft,
  canSwipeRight,
  edgeResistance,
}: OffsetInput): number => {
  const isBlocked = deltaX < 0 ? !canSwipeLeft : !canSwipeRight;
  return clampSymmetric(isBlocked ? deltaX * edgeResistance : deltaX, width);
};

export const resolveRelease = ({
  offset,
  velocity,
  width,
  distanceRatio,
  canSwipeLeft,
  canSwipeRight,
}: ReleaseInput): SwipeDirection | null => {
  const distance = Math.abs(offset);
  const isFast = Math.abs(velocity) >= FLICK_VELOCITY;
  const isReturning = isFast && velocity * offset < 0;
  const isFlick = distance >= MIN_FLICK_DISTANCE && isFast && !isReturning;
  const isFar = distance >= width * distanceRatio && !isReturning;
  const isAllowed = offset < 0 ? canSwipeLeft : canSwipeRight;

  if (!(isFar || isFlick) || !isAllowed) return null;
  return offset < 0 ? 'left' : 'right';
};