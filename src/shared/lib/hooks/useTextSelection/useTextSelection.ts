import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { lockGestures } from '@/shared/lib/utils/gestureLock';
import { paintHighlight } from './lib/highlightPaint';
import { isOrdered } from './lib/selectionRange';
import { countOccurrencesBefore } from './lib/selectionOccurrence';
import { readSelectionGeometry } from './lib/selectionGeometry';
import { useHandleDrag } from './model/hooks/useHandleDrag';
import { useSelectionGesture } from './model/hooks/useSelectionGesture';
import type { SelectionModel, TextSelection, TextSelectionOptions } from './model/types';

const createModel = (): SelectionModel => ({ range: null, caretA: null, caretB: null, lastX: 0 });

export function useTextSelection(
  ref: RefObject<HTMLElement | null>,
  isEnabled: boolean,
  { highlightName, ignoreSelector }: TextSelectionOptions,
) {
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const modelRef = useRef<SelectionModel>(createModel());
  const releaseRef = useRef<(() => void) | null>(null);

  const unlock = useCallback(() => {
    releaseRef.current?.();
    releaseRef.current = null;
  }, []);

  const lock = useCallback(() => {
    if (!releaseRef.current) releaseRef.current = lockGestures();
  }, []);

  const clear = useCallback(() => {
    modelRef.current = createModel();
    paintHighlight(highlightName, null);
    unlock();
    setSelection(null);
    setIsDragging(false);
  }, [highlightName, unlock]);

  const publish = useCallback(
    (range: Range, x: number) => {
      const text = range.toString().trim();
      if (text === '') {
        clear();
        return;
      }
      const { caretA, caretB } = modelRef.current;
      const isAStart = caretA && caretB ? isOrdered(caretA, caretB) : true;
      setSelection({
        text,
        x,
        occurrence: countOccurrencesBefore(ref.current, range, text),
        ...readSelectionGeometry(range, isAStart),
      });
    },
    [clear, ref],
  );

  const applyRange = useCallback(
    (range: Range, x: number) => {
      modelRef.current.range = range;
      modelRef.current.lastX = x;
      paintHighlight(highlightName, range);
      publish(range, x);
    },
    [highlightName, publish],
  );

  useSelectionGesture(ref, isEnabled, ignoreSelector, {
    hasSelection: () => modelRef.current.range !== null,
    onDismiss: clear,
    onStart: (range) => {
      lock();
      modelRef.current.range = range;
      paintHighlight(highlightName, range);
    },
    onExtend: (range, x) => {
      modelRef.current.range = range;
      modelRef.current.lastX = x;
      paintHighlight(highlightName, range);
    },
    onFinish: () => {
      const { range, lastX } = modelRef.current;
      if (!range) return;
      modelRef.current.caretA = { node: range.startContainer, offset: range.startOffset };
      modelRef.current.caretB = { node: range.endContainer, offset: range.endOffset };
      publish(range, lastX);
    },
  });

  const handles = useHandleDrag({
    rootRef: ref,
    modelRef,
    onChange: applyRange,
    onDraggingChange: setIsDragging,
  });

  useEffect(() => {
    if (!isEnabled) clear();
    return clear;
  }, [isEnabled, clear]);

  const hasSelection = selection !== null;

  useEffect(() => {
    if (!hasSelection || isDragging) return undefined;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { range, lastX } = modelRef.current;
        if (range) publish(range, lastX);
      });
    };

    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [hasSelection, isDragging, publish]);

  return {
    selection,
    isDragging,
    clear,
    beginHandleDrag: handles.begin,
    moveHandle: handles.move,
    endHandleDrag: handles.end,
  };
}