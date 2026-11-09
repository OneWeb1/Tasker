import type { RefObject } from 'react';

export type SwipeDirection = 'left' | 'right';
export type SwipePhase = 'idle' | 'dragging' | 'settling';
export type SwipeSide = -1 | 0 | 1;

export interface SwipeProgress {
  direction: SwipeSide;
  progress: number;
  isSettling: boolean;
}

export interface UseHorizontalSwipeOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  canSwipeLeft?: boolean;
  canSwipeRight?: boolean;
  edgeResistance?: number | undefined;
  gap?: number;
  distanceRatio?: number;
  settleDuration?: number;
  targetRef?: RefObject<HTMLElement | null>;
  onProgress?: (state: SwipeProgress) => void;
}

export interface SwipeGesture {
  pointerId: number;
  x: number;
  y: number;
  time: number;
  width: number;
  axis: 'x' | null;
}