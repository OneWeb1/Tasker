import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

interface UseSwipeDownToCloseOptions {
  targetRef: RefObject<HTMLElement | null>;
  scrollRef: RefObject<HTMLElement | null>;
  isEnabled: boolean;
  onDismiss: () => void;
}

interface Gesture {
  x: number;
  y: number;
  time: number;
}

const AXIS_LOCK_DISTANCE = 8;
const DISTANCE_RATIO = 0.25;
const FLICK_VELOCITY = 0.5;
const MIN_FLICK_DISTANCE = 24;

export function useSwipeDownToClose({
  targetRef,
  scrollRef,
  isEnabled,
  onDismiss,
}: UseSwipeDownToCloseOptions) {
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  });

  useEffect(() => {
    const element = targetRef.current;
    if (!isEnabled || !element) return;

    let gesture: Gesture | null = null;
    let isLocked = false;
    let offset = 0;

    const onTouchStart = (event: TouchEvent) => {
      const isAtTop = (scrollRef.current?.scrollTop ?? 0) <= 0;
      if (event.touches.length !== 1 || !isAtTop) {
        gesture = null;
        return;
      }
      const touch = event.touches[0];
      gesture = { x: touch.clientX, y: touch.clientY, time: event.timeStamp };
      isLocked = false;
      offset = 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!gesture) return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - gesture.x;
      const deltaY = touch.clientY - gesture.y;

      if (!isLocked) {
        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < AXIS_LOCK_DISTANCE) return;
        if (deltaY <= 0 || Math.abs(deltaX) >= Math.abs(deltaY)) {
          gesture = null;
          return;
        }
        isLocked = true;
        gesture = { x: touch.clientX, y: touch.clientY, time: event.timeStamp };
        element.style.transition = 'none';
        return;
      }

      if (event.cancelable) event.preventDefault();
      offset = Math.max(0, deltaY);
      element.style.transform = `translateY(${offset}px)`;
    };

    const finish = (event: TouchEvent, canDismiss: boolean) => {
      const current = gesture;
      const wasLocked = isLocked;
      gesture = null;
      isLocked = false;
      if (!current || !wasLocked) return;

      const elapsed = Math.max(event.timeStamp - current.time, 1);
      const isFar = offset >= element.clientHeight * DISTANCE_RATIO;
      const isFlick = offset >= MIN_FLICK_DISTANCE && offset / elapsed >= FLICK_VELOCITY;

      element.style.transition = '';
      if (canDismiss && (isFar || isFlick)) {
        element.style.transform = 'translateY(100%)';
        dismissRef.current();
        return;
      }
      element.style.transform = '';
    };

    const onTouchEnd = (event: TouchEvent) => finish(event, true);
    const onTouchCancel = (event: TouchEvent) => finish(event, false);

    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchmove', onTouchMove, { passive: false });
    element.addEventListener('touchend', onTouchEnd);
    element.addEventListener('touchcancel', onTouchCancel);

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
      element.removeEventListener('touchcancel', onTouchCancel);
      element.style.transition = '';
      element.style.transform = '';
    };

  }, [isEnabled, scrollRef, targetRef]);
}