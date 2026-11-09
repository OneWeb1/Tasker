import { useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { clampCaret, findSelectionBlock } from '../../lib/blockBoundary';
import { caretFromPoint, caretInRoot } from '../../lib/caretFromPoint';
import { extendRange } from '../../lib/selectionRange';
import { expandToWord } from '../../lib/wordRange';
import {
  CLICK_GUARD_MS,
  DOUBLE_TAP_DISTANCE,
  DOUBLE_TAP_MS,
  HAPTIC_MS,
  LONG_PRESS_MS,
  MOVE_TOLERANCE,
} from '../constants';

const SELECTION_UI_SELECTOR = '[data-selection-ui]';

export interface SelectionGestureHandlers {
  hasSelection: () => boolean;
  onDismiss: () => void;
  onStart: (range: Range) => void;
  onExtend: (range: Range, x: number) => void;
  onFinish: () => void;
}

export function useSelectionGesture(
  ref: RefObject<HTMLElement | null>,
  isEnabled: boolean,
  ignoreSelector: string | undefined,
  handlers: SelectionGestureHandlers,
) {
  const handlersRef = useRef(handlers);

  useLayoutEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const root = ref.current;
    if (!isEnabled || !root) return undefined;

    let pressTimer = 0;
    let guardTimer = 0;
    let startX = 0;
    let startY = 0;
    let isSelecting = false;
    let isGuardingClick = false;
    let isTapCandidate = false;
    let anchor: Range | null = null;
    let block: HTMLElement | null = null;
    let isStartable = false;
    let isPossibleTap = false;
    let lastTapAt = 0;
    let lastTapX = 0;
    let lastTapY = 0;

    const pickWord = (): Range | null => {
      const caret = caretFromPoint(startX, startY);
      if (!caret || !root.contains(caret.node)) return null;
      return expandToWord(caret);
    };

    const begin = () => {
      const word = pickWord();
      if (!word) return;
      isPossibleTap = false;

      anchor = word;
      block = findSelectionBlock(root, word.startContainer);
      isSelecting = true;
      isGuardingClick = true;
      isTapCandidate = false;
      handlersRef.current.onStart(word.cloneRange());
      navigator.vibrate?.(HAPTIC_MS);
    };

    const selectWordOnDoubleTap = () => {
      const now = Date.now();
      const isDouble =
        now - lastTapAt <= DOUBLE_TAP_MS &&
        Math.hypot(startX - lastTapX, startY - lastTapY) <= DOUBLE_TAP_DISTANCE;
      if (!isDouble) {
        lastTapAt = now;
        lastTapX = startX;
        lastTapY = startY;
        return;
      }

      lastTapAt = 0;
      const word = pickWord();
      if (!word) return;

      isGuardingClick = true;
      window.clearTimeout(guardTimer);
      guardTimer = window.setTimeout(() => {
        isGuardingClick = false;
      }, CLICK_GUARD_MS);
      handlersRef.current.onStart(word.cloneRange());
      handlersRef.current.onFinish();
      navigator.vibrate?.(HAPTIC_MS);
    };

    const onTouchStart = (event: TouchEvent) => {
      const { target } = event;
      const touch = event.touches[0];
      if (!touch || event.touches.length !== 1 || !(target instanceof Element)) return;
      if (target.closest(SELECTION_UI_SELECTOR)) return;

      startX = touch.clientX;
      startY = touch.clientY;
      isTapCandidate = handlersRef.current.hasSelection();
      window.clearTimeout(pressTimer);

      const canStart = root.contains(target) && !(ignoreSelector && target.closest(ignoreSelector));
      isStartable = canStart;
      isPossibleTap = true;
      if (canStart) pressTimer = window.setTimeout(begin, LONG_PRESS_MS);
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      if (!isSelecting) {
        if (Math.hypot(touch.clientX - startX, touch.clientY - startY) > MOVE_TOLERANCE) {
          window.clearTimeout(pressTimer);
          isTapCandidate = false;
          isPossibleTap = false;
        }
        return;
      }

      if (event.cancelable) event.preventDefault();
      const caret = caretInRoot(root, touch.clientX, touch.clientY);
      if (!anchor || !caret) return;
      const bounded = block ? clampCaret(block, caret) : caret;
      handlersRef.current.onExtend(extendRange(anchor, bounded), touch.clientX);
    };

    const onTouchEnd = (event: TouchEvent) => {
      window.clearTimeout(pressTimer);

      if (!isSelecting) {
        const isTap = isTapCandidate && event.type === 'touchend';
        const isQuickTap = isPossibleTap && isStartable && event.type === 'touchend';
        isTapCandidate = false;
        isPossibleTap = false;
        if (isTap) handlersRef.current.onDismiss();
        if (isQuickTap) selectWordOnDoubleTap();
        return;
      }

      isSelecting = false;
      anchor = null;
      block = null;
      handlersRef.current.onFinish();
      window.clearTimeout(guardTimer);
      guardTimer = window.setTimeout(() => {
        isGuardingClick = false;
      }, CLICK_GUARD_MS);
    };

    const onClickCapture = (event: Event) => {
      if (!isGuardingClick) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const onContextMenu = (event: Event) => {
      if (root.contains(event.target as Node)) event.preventDefault();
    };

    window.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    window.addEventListener('touchmove', onTouchMove, { capture: true, passive: false });
    window.addEventListener('touchend', onTouchEnd, { capture: true, passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { capture: true, passive: true });
    root.addEventListener('click', onClickCapture, true);
    document.addEventListener('contextmenu', onContextMenu);

    return () => {
      window.clearTimeout(pressTimer);
      window.clearTimeout(guardTimer);
      window.removeEventListener('touchstart', onTouchStart, true);
      window.removeEventListener('touchmove', onTouchMove, true);
      window.removeEventListener('touchend', onTouchEnd, true);
      window.removeEventListener('touchcancel', onTouchEnd, true);
      root.removeEventListener('click', onClickCapture, true);
      document.removeEventListener('contextmenu', onContextMenu);
    };

  }, [ref, isEnabled, ignoreSelector]);
}