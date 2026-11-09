import { useCallback, useEffect, useRef } from 'react';
import type { MouseEvent, PointerEvent, RefObject } from 'react';
import { autoScrollStep } from '../../lib/autoScrollStep';
import {
  blockTouchScroll,
  getScrollParent,
  prefersReducedMotion,
  triggerHaptic,
} from '../../lib/sortableDom';
import {
  DROP_DURATION_MS,
  HAPTIC_MS,
  LONG_PRESS_MS,
  LONG_PRESS_TOLERANCE_PX,
} from '../constants';
import type { Scheduler } from '../scheduler';
import type { SortableEvent, SortablePhase } from '../sortableMachine';
import type { DragSession } from '../types';
import type { useSortableLayout } from './useSortableLayout';

interface UseSortablePointerOptions {
  isEnabled: boolean;
  scheduler: Scheduler;
  send: (event: SortableEvent) => void;
  getPhase: () => SortablePhase;
  items: RefObject<Map<string, HTMLElement>>;
  containerRef: RefObject<HTMLDivElement | null>;
  latest: RefObject<{ ids: readonly string[] }>;
  layout: Pick<ReturnType<typeof useSortableLayout>, 'begin' | 'applyDrag' | 'applyDrop'>;
  commit: (fromIndex: number, finalIndex: number) => void;
  cancelRelease: () => void;
}

interface PendingPress {
  id: string;
  pointerId: number;
  target: HTMLElement;
  originX: number;
  originY: number;
  pointerY: number;
}

export function useSortablePointer({
  isEnabled,
  scheduler,
  send,
  getPhase,
  items,
  containerRef,
  latest,
  layout,
  commit,
  cancelRelease,
}: UseSortablePointerOptions) {
  const session = useRef<DragSession | null>(null);
  const press = useRef<PendingPress | null>(null);
  const tickFrame = useRef(0);
  const dropTimer = useRef(0);
  const pressTimer = useRef(0);

  const { begin, applyDrag, applyDrop } = layout;

  const tick = useCallback(() => {
    const drag = session.current;
    if (!drag) return;

    autoScrollStep(drag.scrollParent, drag.pointerY);
    applyDrag(drag);
    tickFrame.current = scheduler.requestFrame(tick);
  }, [applyDrag, scheduler]);

  const cancelPress = useCallback(() => {
    scheduler.clearTimer(pressTimer.current);
    press.current = null;
  }, [scheduler]);

  useEffect(() => {
    if (!isEnabled) return;
    return blockTouchScroll(() => press.current !== null || session.current !== null);
  }, [isEnabled]);

  const abort = useCallback(() => {
    scheduler.cancelFrame(tickFrame.current);
    scheduler.clearTimer(dropTimer.current);
    session.current = null;
    cancelPress();
  }, [cancelPress, scheduler]);

  const activate = () => {
    const pending = press.current;
    press.current = null;
    if (!pending) return;

    const { id, pointerId, target, pointerY } = pending;
    const phase = getPhase();
    const element = items.current.get(id);
    const container = containerRef.current;
    const fromIndex = latest.current.ids.indexOf(id);
    if (
      (phase !== 'idle' && phase !== 'releasing') ||
      !element ||
      !container ||
      fromIndex === -1
    ) {
      return;
    }

    cancelRelease();
    try {
      target.setPointerCapture(pointerId);
    } catch {
      return;
    }

    const reducedMotion = prefersReducedMotion();
    session.current = {
      id,
      pointerId,
      fromIndex,
      targetIndex: fromIndex,
      grabOffset: pointerY - element.getBoundingClientRect().top,
      pointerY,
      scrollParent: getScrollParent(container),
      reducedMotion,
    };

    begin(id, reducedMotion);
    send({ type: 'START', id });
    triggerHaptic(HAPTIC_MS);
    tickFrame.current = scheduler.requestFrame(tick);
  };

  const start = (id: string, event: PointerEvent<HTMLElement>) => {
    if (!isEnabled || session.current || press.current) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const phase = getPhase();
    if (phase !== 'idle' && phase !== 'releasing') return;

    press.current = {
      id,
      pointerId: event.pointerId,
      target: event.currentTarget,
      originX: event.clientX,
      originY: event.clientY,
      pointerY: event.clientY,
    };
    pressTimer.current = scheduler.setTimer(activate, LONG_PRESS_MS);

    const { pointerId } = press.current;
    const onEnd = (native: globalThis.PointerEvent) => {
      if (native.pointerId !== pointerId) return;
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      if (press.current?.pointerId === pointerId) cancelPress();
    };
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);

  };

  const move = (event: PointerEvent<HTMLElement>) => {
    const pending = press.current;
    if (pending && pending.pointerId === event.pointerId) {
      pending.pointerY = event.clientY;
      const distance = Math.hypot(
        event.clientX - pending.originX,
        event.clientY - pending.originY,
      );
      if (distance > LONG_PRESS_TOLERANCE_PX) cancelPress();
      return;
    }

    const drag = session.current;
    if (drag && drag.pointerId === event.pointerId) drag.pointerY = event.clientY;
  };

  const finish = (event: PointerEvent<HTMLElement>, isCancelled: boolean) => {
    const pending = press.current;
    if (pending && pending.pointerId === event.pointerId) {
      cancelPress();
      return;
    }

    const drag = session.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    scheduler.cancelFrame(tickFrame.current);
    session.current = null;
    send({ type: 'DROP' });

    if (!isCancelled) {
      drag.pointerY = event.clientY;
      applyDrag(drag);
    }

    const finalIndex = isCancelled ? drag.fromIndex : drag.targetIndex;
    if (!applyDrop(drag, finalIndex)) {
      commit(drag.fromIndex, drag.fromIndex);
      return;
    }

    if (drag.reducedMotion) {
      commit(drag.fromIndex, finalIndex);
      return;
    }

    dropTimer.current = scheduler.setTimer(
      () => commit(drag.fromIndex, finalIndex),
      DROP_DURATION_MS,
    );

  };

  const getPointerHandlers = (id: string) => ({
    onPointerDown: (event: PointerEvent<HTMLElement>) => start(id, event),
    onPointerMove: move,
    onPointerUp: (event: PointerEvent<HTMLElement>) => finish(event, false),
    onPointerCancel: (event: PointerEvent<HTMLElement>) => finish(event, true),
    onLostPointerCapture: (event: PointerEvent<HTMLElement>) => {
      if (event.target === event.currentTarget) finish(event, true);
    },
    onContextMenu: (event: MouseEvent<HTMLElement>) => {
      if (isEnabled) event.preventDefault();
    },
  });

  return { getPointerHandlers, abort };
}