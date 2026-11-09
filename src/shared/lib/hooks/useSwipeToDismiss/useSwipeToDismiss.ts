import { useRef, useState } from 'react';
import type { CSSProperties, MouseEvent, PointerEvent } from 'react';

export type SwipeDismissDirection = 'left' | 'right';

interface UseSwipeToDismissOptions {
  onDismiss: (direction: SwipeDismissDirection) => void;
  distanceRatio?: number;
  isEnabled?: boolean;
}

interface Gesture {
  pointerId: number;
  startX: number;
  startY: number;
  time: number;
  width: number;
  axis: 'x' | null;
}

const AXIS_LOCK_DISTANCE = 8;
const FLICK_VELOCITY = 0.5;
const MIN_FLICK_DISTANCE = 24;
const FLY_OUT_FACTOR = 1.2;
const SETTLE_TRANSITION = 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease';

export function useSwipeToDismiss({
  onDismiss,
  distanceRatio = 0.35,
  isEnabled = true,
}: UseSwipeToDismissOptions) {
  const [drag, setDrag] = useState({ offset: 0, progress: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const gesture = useRef<Gesture | null>(null);
  const offsetRef = useRef(0);
  const didSwipe = useRef(false);

  const applyOffset = (offset: number, width: number) => {
    offsetRef.current = offset;
    setDrag({ offset, progress: Math.min(Math.abs(offset) / width, 1) });
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!isEnabled || isDismissed || gesture.current) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      time: event.timeStamp,
      width: event.currentTarget.clientWidth,
      axis: null,
    };
    didSwipe.current = false;
    setIsHolding(true);

  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - current.startX;
    const deltaY = event.clientY - current.startY;

    if (current.axis === null) {
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < AXIS_LOCK_DISTANCE) return;

      if (Math.abs(deltaX) <= Math.abs(deltaY)) {
        gesture.current = null;
        setIsHolding(false);
        return;
      }

      current.axis = 'x';
      current.startX = event.clientX;
      current.time = event.timeStamp;
      didSwipe.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
      return;
    }

    applyOffset(deltaX, current.width);

  };

  const finish = (event: PointerEvent<HTMLElement>, canDismiss: boolean) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;

    gesture.current = null;
    setIsHolding(false);
    if (current.axis !== 'x') return;
    setIsDragging(false);

    const distance = offsetRef.current;
    const elapsed = Math.max(event.timeStamp - current.time, 1);
    const isFar = Math.abs(distance) >= current.width * distanceRatio;
    const isFlick =
      Math.abs(distance) >= MIN_FLICK_DISTANCE && Math.abs(distance) / elapsed >= FLICK_VELOCITY;

    if (canDismiss && (isFar || isFlick)) {
      const sign = distance < 0 ? -1 : 1;
      setIsDismissed(true);
      applyOffset(sign * current.width * FLY_OUT_FACTOR, current.width);
      onDismiss(sign < 0 ? 'left' : 'right');
      return;
    }

    applyOffset(0, current.width);

  };

  const onPointerLeave = (event: PointerEvent<HTMLElement>) => {
    if (gesture.current?.axis === 'x') return;
    finish(event, false);
  };

  const onClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!didSwipe.current) return;
    didSwipe.current = false;
    event.stopPropagation();
    event.preventDefault();
  };

  const style: CSSProperties = {
    transform: `translateX(${drag.offset}px)`,
    opacity: isDismissed ? 0 : 1 - drag.progress * 0.7,
    transition: isDragging ? 'none' : SETTLE_TRANSITION,
  };

  return {
    style,
    isHolding,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event: PointerEvent<HTMLElement>) => finish(event, true),
      onPointerCancel: (event: PointerEvent<HTMLElement>) => finish(event, false),
      onPointerLeave,
      onClickCapture,
    },
  };
}