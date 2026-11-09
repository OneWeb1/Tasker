import { useCallback, useEffect, useRef } from 'react';
import type { MouseEvent, PointerEvent } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  delay?: number;
  moveTolerance?: number;
}

const DEFAULT_DELAY = 450;
const DEFAULT_MOVE_TOLERANCE = 8;

export function useLongPress({
  onLongPress,
  delay = DEFAULT_DELAY,
  moveTolerance = DEFAULT_MOVE_TOLERANCE,
}: UseLongPressOptions) {
  const timerRef = useRef<number | null>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    originRef.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    cancel();
    firedRef.current = false;
    originRef.current = { x: event.clientX, y: event.clientY };
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      originRef.current = null;
      firedRef.current = true;
      onLongPress();
    }, delay);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const origin = originRef.current;
    if (!origin) return;

    const distance = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);
    if (distance > moveTolerance) cancel();
  };

  const onClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!firedRef.current) return;
    firedRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onContextMenu: (event: MouseEvent<HTMLElement>) => event.preventDefault(),
    onClickCapture,
  };
}