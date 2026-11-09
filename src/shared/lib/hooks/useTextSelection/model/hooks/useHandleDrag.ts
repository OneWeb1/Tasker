import { useCallback, useEffect, useRef } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import { clampCaret, findSelectionBlock } from '../../lib/blockBoundary';
import { caretInRoot } from '../../lib/caretFromPoint';
import { findScrollParent } from '../../lib/scrollParent';
import { rangeBetween } from '../../lib/selectionRange';
import { AUTOSCROLL_EDGE, AUTOSCROLL_MAX_SPEED, HANDLE_TOUCH_OFFSET } from '../constants';
import type { HandleId, SelectionModel } from '../types';

interface HandleDragOptions {
  rootRef: RefObject<HTMLElement | null>;
  modelRef: MutableRefObject<SelectionModel>;
  onChange: (range: Range, x: number) => void;
  onDraggingChange: (isDragging: boolean) => void;
}

const readScrollDelta = (y: number, top: number, bottom: number): number => {
  if (y < top + AUTOSCROLL_EDGE) {
    return -AUTOSCROLL_MAX_SPEED * Math.min(1, (top + AUTOSCROLL_EDGE - y) / AUTOSCROLL_EDGE);
  }
  if (y > bottom - AUTOSCROLL_EDGE) {
    return AUTOSCROLL_MAX_SPEED * Math.min(1, (y - (bottom - AUTOSCROLL_EDGE)) / AUTOSCROLL_EDGE);
  }
  return 0;
};

export function useHandleDrag({ rootRef, modelRef, onChange, onDraggingChange }: HandleDragOptions) {
  const draggingRef = useRef<HandleId | null>(null);
  const pointRef = useRef<{ x: number; y: number } | null>(null);
  const isDirtyRef = useRef(false);
  const frameRef = useRef(0);

  const apply = useCallback(
    (which: HandleId, x: number, y: number) => {
      const root = rootRef.current;
      const model = modelRef.current;
      if (!root || !model.caretA || !model.caretB) return;

      const raw = caretInRoot(root, x, y - HANDLE_TOUCH_OFFSET);
      if (!raw) return;

      const fixed = which === 'a' ? model.caretB : model.caretA;
      const block = findSelectionBlock(root, fixed.node);
      const caret = block ? clampCaret(block, raw) : raw;

      const next =
        which === 'a' ? rangeBetween(caret, model.caretB) : rangeBetween(model.caretA, caret);
      if (next.toString().trim() === '') return;

      if (which === 'a') model.caretA = caret;
      else model.caretB = caret;
      onChange(next, x);
    },
    [modelRef, onChange, rootRef],
  );

  const tick = useCallback(() => {
    frameRef.current = requestAnimationFrame(tick);
    const which = draggingRef.current;
    const point = pointRef.current;
    if (!which || !point) return;

    const scroller = findScrollParent(rootRef.current);
    if (scroller) {
      const rect = scroller.getBoundingClientRect();
      const delta = readScrollDelta(
        point.y,
        Math.max(rect.top, 0),
        Math.min(rect.bottom, window.innerHeight),
      );
      if (delta !== 0) {
        const before = scroller.scrollTop;
        scroller.scrollTop += delta;
        if (scroller.scrollTop !== before) isDirtyRef.current = true;
      }
    }

    if (!isDirtyRef.current) return;
    isDirtyRef.current = false;
    apply(which, point.x, point.y);
  }, [apply, rootRef]);

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    pointRef.current = null;
    isDirtyRef.current = false;
    draggingRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const begin = useCallback(
    (which: HandleId) => {
      stop();
      draggingRef.current = which;
      frameRef.current = requestAnimationFrame(tick);
      onDraggingChange(true);
    },
    [onDraggingChange, stop, tick],
  );

  const move = useCallback((x: number, y: number) => {
    if (!draggingRef.current) return;
    pointRef.current = { x, y };
    isDirtyRef.current = true;
  }, []);

  const end = useCallback(() => {
    stop();
    onDraggingChange(false);
  }, [onDraggingChange, stop]);

  return { begin, move, end };
}