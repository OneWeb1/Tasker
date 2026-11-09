import { useRef, useState } from 'react';
import type { CSSProperties, MouseEvent, PointerEvent } from 'react';
import { recoverFirstTap } from '@/shared/lib/utils/recoverFirstTap';

interface UseSwipeLeftToCloseOptions {
  onClose: () => void;
  isEnabled?: boolean;
  distanceRatio?: number;
}

interface Gesture {
  pointerId: number;
  startX: number;
  startY: number;
  time: number;
  width: number;
  isLocked: boolean;
}

const AXIS_LOCK_DISTANCE = 8;
const FLICK_VELOCITY = 0.4;
const MIN_FLICK_DISTANCE = 24;

export function useSwipeLeftToClose({
  onClose,
  isEnabled = true,
  distanceRatio = 0.3,
}: UseSwipeLeftToCloseOptions) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const gesture = useRef<Gesture | null>(null);
  const offsetRef = useRef(0);
  const didSwipe = useRef(false);

  const applyOffset = (value: number) => {
    offsetRef.current = value;
    setOffset(value);
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!isEnabled || !event.isPrimary) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      time: event.timeStamp,
      width: event.currentTarget.clientWidth,
      isLocked: false,
    };
    didSwipe.current = false;
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - current.startX;
    const deltaY = event.clientY - current.startY;

    if (!current.isLocked) {
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < AXIS_LOCK_DISTANCE) return;

      if (deltaX >= 0 || Math.abs(deltaX) <= Math.abs(deltaY)) {
        gesture.current = null;
        return;
      }

      current.isLocked = true;
      current.startX = event.clientX;
      current.time = event.timeStamp;
      didSwipe.current = true;
      if (event.pointerType === 'mouse') event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
      return;
    }

    applyOffset(Math.min(0, event.clientX - current.startX));

  };

  const finish = (event: PointerEvent<HTMLElement>, canClose: boolean) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;

    gesture.current = null;
    if (!current.isLocked) return;

    window.setTimeout(() => {
      didSwipe.current = false;
    }, 0);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const distance = -offsetRef.current;
    const elapsed = Math.max(event.timeStamp - current.time, 1);
    const isFar = distance >= current.width * distanceRatio;
    const isFlick = distance >= MIN_FLICK_DISTANCE && distance / elapsed >= FLICK_VELOCITY;

    setIsDragging(false);
    applyOffset(0);
    if (canClose && (isFar || isFlick)) {
      recoverFirstTap();
      onClose();
    }
  };

  const onClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!didSwipe.current) return;
    didSwipe.current = false;
    event.stopPropagation();
    event.preventDefault();
  };

  const style: CSSProperties | undefined = isDragging
    ? { transform: `translateX(${offset}px)`, transition: 'none' }
    : undefined;

  return {
    style,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event: PointerEvent<HTMLElement>) => finish(event, true),
      onPointerCancel: (event: PointerEvent<HTMLElement>) => finish(event, false),
      onClickCapture,
    },
  };
}