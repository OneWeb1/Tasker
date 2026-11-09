import { clamp } from '@/shared/lib/utils/motion';
import {
  AXIS_LOCK_DISTANCE,
  COMMIT_MAX_MS,
  COMMIT_MIN_MS,
  DISTANCE_RATIO,
  FLICK_VELOCITY,
  MIN_COMMIT_VELOCITY,
  MIN_FLICK_DISTANCE,
} from '../../constants/pageSwipe';

export type SwipeDirection = 1 | -1;

export type AxisLock =
  | { status: 'pending' }
  | { status: 'rejected' }
  | { status: 'locked'; direction: SwipeDirection };

interface CommitInput {
  dragged: number;
  velocity: number;
  width: number;
}

export const lockSwipeAxis = (deltaX: number, deltaY: number): AxisLock => {
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < AXIS_LOCK_DISTANCE) {
    return { status: 'pending' };
  }
  if (Math.abs(deltaX) <= Math.abs(deltaY)) return { status: 'rejected' };
  return { status: 'locked', direction: deltaX > 0 ? 1 : -1 };
};

export const shouldCommitSwipe = ({ dragged, velocity, width }: CommitInput): boolean => {
  const isFar = dragged >= width * DISTANCE_RATIO;
  const isFlick = dragged >= MIN_FLICK_DISTANCE && velocity >= FLICK_VELOCITY;
  const isReturning = velocity <= -FLICK_VELOCITY;
  return !isReturning && (isFar || isFlick);
};

export const getCommitDuration = (remaining: number, velocity: number): number =>
  clamp(
    (remaining * 2) / Math.max(velocity, MIN_COMMIT_VELOCITY),
    COMMIT_MIN_MS,
    COMMIT_MAX_MS,
  );