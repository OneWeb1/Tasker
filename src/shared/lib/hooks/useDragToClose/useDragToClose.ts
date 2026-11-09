import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';

interface UseDragToCloseOptions {
  onClose: () => void;
  threshold?: number;
}

export function useDragToClose({ onClose, threshold = 120 }: UseDragToCloseOptions) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    startY.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!isDragging) return;
    setOffset(Math.max(0, event.clientY - startY.current));
  };

  const finishDrag = () => {
    if (!isDragging) return;
    const shouldClose = offset >= threshold;
    setIsDragging(false);
    setOffset(0);
    if (shouldClose) onClose();
  };

  return {
    offset,
    isDragging,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
    },
  };
}