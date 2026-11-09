import { startTransition, useEffect, useRef, useState } from 'react';
import type { PointerEvent, TransitionEvent } from 'react';
import { flushSync } from 'react-dom';
import { prefersReducedMotion } from '@/shared/lib/utils/motion';
import { recoverFirstTap } from '@/shared/lib/utils/recoverFirstTap';
import { lockTouchScroll } from '@/shared/lib/utils/touchScrollLock';
import { isInNestedHorizontalScroller } from '@/shared/lib/utils/touchTarget';
import { createVelocityTracker } from '@/shared/lib/utils/velocityTracker';
import { lockAxis, resolveOffset, resolveRelease } from './lib/swipeDecision';
import {
  prepareTarget,
  releaseTarget,
  setTargetOffset,
  startTargetSettle,
} from './lib/swipeTarget';
import {
  DEFAULT_DISTANCE_RATIO,
  DEFAULT_EDGE_RESISTANCE,
  SETTLE_DURATION_MS,
  SETTLE_FALLBACK_PADDING_MS,
} from './model/constants';
import { useClickGuard } from './model/hooks/useClickGuard';
import type {
  SwipeDirection,
  SwipeGesture,
  SwipePhase,
  SwipeSide,
  UseHorizontalSwipeOptions,
} from './model/types';

export function useHorizontalSwipe(options: UseHorizontalSwipeOptions) {
  const {
    canSwipeLeft = true,
    canSwipeRight = true,
    edgeResistance = DEFAULT_EDGE_RESISTANCE,
    gap = 0,
    distanceRatio = DEFAULT_DISTANCE_RATIO,
    settleDuration = SETTLE_DURATION_MS,
    targetRef,
  } = options;

  const [offset, setOffset] = useState(0);
  const [direction, setDirection] = useState<SwipeSide>(0);
  const [phase, setPhaseState] = useState<SwipePhase>('idle');

  const optionsRef = useRef(options);
  const phaseRef = useRef<SwipePhase>('idle');
  const offsetRef = useRef(0);
  const widthRef = useRef(0);
  const sideRef = useRef<SwipeSide>(0);
  const frameRef = useRef(0);
  const gestureRef = useRef<SwipeGesture | null>(null);
  const pendingRef = useRef<SwipeDirection | null>(null);
  const fallbackTimer = useRef(0);
  const trackerRef = useRef(createVelocityTracker());
  const clickGuard = useClickGuard();

  useEffect(() => {
    optionsRef.current = options;
  });

  const setPhase = (next: SwipePhase) => {
    phaseRef.current = next;
    setPhaseState(next);
  };

  const syncDirection = (side: SwipeSide) => {
    if (sideRef.current === side) return;
    sideRef.current = side;
    if (side === 0) setDirection(0);
    else startTransition(() => setDirection(side));
  };

  const emitProgress = (value: number) => {
    optionsRef.current.onProgress?.({
      direction: Math.sign(value) as SwipeSide,
      progress: widthRef.current > 0 ? Math.min(1, Math.abs(value) / widthRef.current) : 0,
      isSettling: phaseRef.current === 'settling',
    });
  };

  const flush = () => {
    frameRef.current = 0;
    const value = offsetRef.current;
    const target = targetRef?.current;
    if (target) setTargetOffset(target, value);
    emitProgress(value);
  };

  const applyOffset = (value: number, isImmediate = false) => {
    offsetRef.current = value;
    if (phaseRef.current !== 'settling') syncDirection(Math.sign(value) as SwipeSide);

    if (!targetRef?.current) {
      setOffset(value);
      emitProgress(value);
      return;
    }

    if (isImmediate) {
      cancelAnimationFrame(frameRef.current);
      flush();
      return;
    }
    if (frameRef.current === 0) frameRef.current = requestAnimationFrame(flush);
  };

  const complete = (swipeDirection: SwipeDirection | null) => {
    window.clearTimeout(fallbackTimer.current);
    pendingRef.current = null;

    const target = targetRef?.current;
    if (target) releaseTarget(target);

    const { onSwipeLeft, onSwipeRight } = optionsRef.current;
    const notify = () => {
      if (swipeDirection === 'left') onSwipeLeft();
      else if (swipeDirection === 'right') onSwipeRight();
    };

    if (!target) {
      setPhase('idle');
      applyOffset(0, true);
      notify();
      return;
    }

    flushSync(() => {
      setPhase('idle');
      syncDirection(0);
      notify();
    });
    applyOffset(0, true);

  };

  const settle = (swipeDirection: SwipeDirection | null, travel: number) => {
    const destination =
      swipeDirection === 'left' ? -travel : swipeDirection === 'right' ? travel : 0;

    if (offsetRef.current === destination) {
      complete(swipeDirection);
      return;
    }

    pendingRef.current = swipeDirection;
    setPhase('settling');

    const target = targetRef?.current;
    if (target) startTargetSettle(target, prefersReducedMotion(), settleDuration);

    window.clearTimeout(fallbackTimer.current);
    fallbackTimer.current = window.setTimeout(() => {
      if (phaseRef.current === 'settling') complete(pendingRef.current);
    }, settleDuration + SETTLE_FALLBACK_PADDING_MS);

    applyOffset(destination, true);
  };

  useEffect(
    () => () => {
      cancelAnimationFrame(frameRef.current);
      window.clearTimeout(fallbackTimer.current);
      const target = targetRef?.current;
      if (target) releaseTarget(target);
    },
    [targetRef],
  );

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    clickGuard.reset();
    if (!event.isPrimary) return;
    const clientWidth = event.currentTarget.clientWidth;
    if (phaseRef.current === 'settling') complete(pendingRef.current);
    if (isInNestedHorizontalScroller(event.target, event.currentTarget)) {
      gestureRef.current = null;
      return;
    }

    const travel = clientWidth + gap;
    widthRef.current = travel;
    gestureRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      time: event.timeStamp,
      width: travel,
      axis: null,
    };
    trackerRef.current.start(event.clientX, event.timeStamp);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    trackerRef.current.move(event.clientX, event.timeStamp);

    const deltaX = event.clientX - gesture.x;
    const deltaY = event.clientY - gesture.y;

    if (gesture.axis === null) {
      const lock = lockAxis(deltaX, deltaY);
      if (lock === 'pending') return;
      if (lock === 'y') {
        gestureRef.current = null;
        return;
      }

      gesture.axis = 'x';
      clickGuard.arm();
      lockTouchScroll();
      event.currentTarget.setPointerCapture(event.pointerId);

      const target = targetRef?.current;
      if (target) prepareTarget(target);
      setPhase('dragging');
    }

    applyOffset(
      resolveOffset({
        deltaX,
        width: gesture.width,
        canSwipeLeft,
        canSwipeRight,
        edgeResistance,
      }),
    );

  };

  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    if (gesture.axis !== 'x') return;
    clickGuard.releaseSoon();
    recoverFirstTap();

    const result = resolveRelease({
      offset: offsetRef.current,
      velocity: trackerRef.current.read(event.timeStamp),
      width: gesture.width,
      distanceRatio,
      canSwipeLeft,
      canSwipeRight,
    });
    settle(result, gesture.width);
  };

  const onPointerCancel = () => {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    if (gesture?.axis !== 'x') return;
    clickGuard.releaseSoon();
    settle(null, gesture.width);
  };

  const onTransitionEnd = (event: TransitionEvent<HTMLElement>) => {
    if (phaseRef.current !== 'settling') return;
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;
    complete(pendingRef.current);
  };

  return {
    offset,
    direction,
    progress: widthRef.current > 0 ? Math.min(1, Math.abs(offset) / widthRef.current) : 0,
    isDragging: phase === 'dragging',
    isSettling: phase === 'settling',
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onClickCapture: clickGuard.onClickCapture,
    },
    onTransitionEnd,
  };
}