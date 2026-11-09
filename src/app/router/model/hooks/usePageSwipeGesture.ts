import { useEffect, useRef } from 'react';
import type { RoutePath } from '@/shared/config/routePaths';
import { clamp } from '@/shared/lib/utils/motion';
import { lockTouchScroll } from '@/shared/lib/utils/touchScrollLock';
import { createVelocityTracker } from '@/shared/lib/utils/velocityTracker';
import { isPageSwipeBlocked } from '../lib/isPageSwipeBlocked';
import { lockSwipeAxis, shouldCommitSwipe } from '../lib/pageSwipeDecision';
import type { SwipeDirection } from '../lib/pageSwipeDecision';

export interface PageSwipeRelease {
  target: RoutePath;
  direction: SwipeDirection;
  velocity: number;
  isCommit: boolean;
}

interface UsePageSwipeGestureOptions {
  isEnabled: boolean;
  canStart: () => boolean;
  getWidth: () => number;
  resolveTarget: (direction: SwipeDirection) => RoutePath | null;
  onLock: (direction: SwipeDirection, target: RoutePath, width: number) => void;
  onDrag: (offset: number) => void;
  onRelease: (release: PageSwipeRelease) => void;
  onCancel: () => void;
}

interface Lock {
  direction: SwipeDirection;
  target: RoutePath;
  width: number;
}

interface Gesture {
  startX: number;
  startY: number;
  lock: Lock | null;
}

export function usePageSwipeGesture(options: UsePageSwipeGestureOptions) {
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  const { isEnabled } = options;

  useEffect(() => {
    if (!isEnabled) return;

    const tracker = createVelocityTracker();
    let gesture: Gesture | null = null;

    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (
        !touch ||
        event.touches.length !== 1 ||
        !optionsRef.current.canStart() ||
        isPageSwipeBlocked(event.target)
      ) {
        gesture = null;
        return;
      }
      gesture = { startX: touch.clientX, startY: touch.clientY, lock: null };
      tracker.start(touch.clientX, event.timeStamp);
    };

    const onMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!gesture || !touch) return;

      tracker.move(touch.clientX, event.timeStamp);
      const deltaX = touch.clientX - gesture.startX;
      const deltaY = touch.clientY - gesture.startY;

      if (!gesture.lock) {
        const axis = lockSwipeAxis(deltaX, deltaY);
        if (axis.status === 'pending') return;

        const target =
          axis.status === 'locked' ? optionsRef.current.resolveTarget(axis.direction) : null;
        if (axis.status !== 'locked' || !target) {
          gesture = null;
          return;
        }

        const width = optionsRef.current.getWidth();
        gesture.startX = touch.clientX;
        gesture.lock = { direction: axis.direction, target, width };
        if (event.cancelable) event.preventDefault();
        lockTouchScroll();
        optionsRef.current.onLock(axis.direction, target, width);
        return;
      }

      const { direction, width } = gesture.lock;
      optionsRef.current.onDrag(direction * clamp(deltaX * direction, 0, width));
    };

    const onEnd = (event: TouchEvent) => {
      const active = gesture;
      gesture = null;
      const touch = event.changedTouches[0];
      if (!active?.lock || !touch) return;

      const { direction, target, width } = active.lock;
      const dragged = Math.max(0, (touch.clientX - active.startX) * direction);
      const velocity = tracker.read(event.timeStamp) * direction;
      optionsRef.current.onRelease({
        target,
        direction,
        velocity,
        isCommit: shouldCommitSwipe({ dragged, velocity, width }),
      });
    };

    const onCancel = () => {
      const wasLocked = gesture?.lock != null;
      gesture = null;
      if (wasLocked) optionsRef.current.onCancel();
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd, { passive: true });
    window.addEventListener('touchcancel', onCancel, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onCancel);
    };

  }, [isEnabled]);
}