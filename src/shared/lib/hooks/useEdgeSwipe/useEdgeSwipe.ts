import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { isGesturesLocked } from '@/shared/lib/utils/gestureLock';
import { recoverFirstTap } from '@/shared/lib/utils/recoverFirstTap';
import { lockTouchScroll } from '@/shared/lib/utils/touchScrollLock';
import { isEditableTarget, isInHorizontalScroller } from '@/shared/lib/utils/touchTarget';
import { markEdgeSwipeCommitted, setEdgeSwipeActive } from './edgeSwipeStore';

interface UseEdgeSwipeOptions {
  onSwipe: () => void;
  isEnabled: boolean;
  isActive?: boolean;
  targetRef?: RefObject<HTMLElement | null>;
  showBackdrop?: boolean;
  marksRouteCommit?: boolean;
  zoneWidth?: number;
  distanceRatio?: number;
}

interface Gesture {
  startX: number;
  startY: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  isLocked: boolean;
}

const IGNORE_SELECTOR = '[data-edge-swipe-ignore]';
const PROGRESS_SCOPE_SELECTOR = '[data-edge-swipe-scope]';
const DEFAULT_ZONE = Number.POSITIVE_INFINITY;
const DEFAULT_DISTANCE_RATIO = 0.25;
const AXIS_LOCK_DISTANCE = 6;
const FLICK_VELOCITY = 0.5;
const MIN_FLICK_DISTANCE = 16;
const VELOCITY_SMOOTHING = 0.6;
const STALE_VELOCITY_MS = 100;
const MIN_CLOSE_VELOCITY = 1.4;
const CLOSE_MIN_MS = 120;
const CLOSE_MAX_MS = 240;
const RETURN_MS = 240;
const FALLBACK_MS = 600;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
const easeOutQuad = (t: number): number => 1 - Math.pow(1 - t, 2.4);
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const activeStack: object[] = [];

export function useEdgeSwipe({
  onSwipe,
  isEnabled,
  isActive = isEnabled,
  targetRef,
  showBackdrop = false,
  marksRouteCommit = true,
  zoneWidth = DEFAULT_ZONE,
  distanceRatio = DEFAULT_DISTANCE_RATIO,
}: UseEdgeSwipeOptions) {
  const onSwipeRef = useRef(onSwipe);
  const isEnabledRef = useRef(isEnabled);

  useEffect(() => {
    onSwipeRef.current = onSwipe;
    isEnabledRef.current = isEnabled;
  }, [onSwipe, isEnabled]);

  useEffect(() => {
    if (!isActive) return;

    const root = document.documentElement;
    const token = {};
    activeStack.push(token);

    let gesture: Gesture | null = null;
    let width = 0;
    let offset = 0;
    let frame = 0;
    let fallbackTimer = 0;
    let isAnimating = false;
    let isCommitted = false;
    let progressHost: HTMLElement | null = null;

    const isTop = () => activeStack[activeStack.length - 1] === token;

    const render = (value: number) => {
      offset = value;
      const target = targetRef?.current;
      if (target) {
        target.style.transform = value === 0 ? '' : `translate3d(${value}px, 0, 0)`;
      }
      if (showBackdrop && progressHost && width > 0) {
        const progress = String(clamp(value / width, 0, 1));
        progressHost.style.setProperty('--edge-swipe-progress', progress);
        if (progressHost !== root) root.style.setProperty('--edge-swipe-progress', progress);
      }
    };

    const reset = () => {
      isAnimating = false;
      isCommitted = false;
      offset = 0;
      const target = targetRef?.current;
      if (target) {
        target.style.transform = '';
        target.style.willChange = '';
        target.style.transition = '';
      }
      progressHost?.style.removeProperty('--edge-swipe-progress');
      if (progressHost !== root) root.style.removeProperty('--edge-swipe-progress');
      progressHost = null;
      setEdgeSwipeActive(false);
    };

    const animateTo = (
      to: number,
      duration: number,
      ease: (t: number) => number,
      onDone: () => void,
    ) => {
      cancelAnimationFrame(frame);
      const from = offset;
      const startedAt = performance.now();
      isAnimating = true;

      const step = (now: number) => {
        const progress = duration > 0 ? clamp((now - startedAt) / duration, 0, 1) : 1;
        render(from + (to - from) * ease(progress));
        if (progress < 1) {
          frame = requestAnimationFrame(step);
          return;
        }
        isAnimating = false;
        onDone();
      };

      frame = requestAnimationFrame(step);
    };

    const settleBack = () => {
      animateTo(0, prefersReducedMotion() ? 0 : RETURN_MS, easeOutCubic, reset);
    };

    const commit = (velocity: number) => {
      isCommitted = true;
      const remaining = Math.max(width - offset, 0);
      const duration = prefersReducedMotion()
        ? 0
        : clamp((remaining * 2) / Math.max(velocity, MIN_CLOSE_VELOCITY), CLOSE_MIN_MS, CLOSE_MAX_MS);

      animateTo(width, duration, easeOutQuad, () => {
        if (showBackdrop && marksRouteCommit) markEdgeSwipeCommitted();
        onSwipeRef.current();
        if (showBackdrop) setEdgeSwipeActive(false);
        fallbackTimer = window.setTimeout(reset, FALLBACK_MS);
      });
    };

    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (
        isAnimating ||
        isCommitted ||
        isGesturesLocked() ||
        !isEnabledRef.current ||
        event.touches.length !== 1 ||
        !touch ||
        touch.clientX > zoneWidth ||
        !isTop() ||
        isEditableTarget(event.target) ||
        isInHorizontalScroller(event.target) ||
        (event.target instanceof Element && event.target.closest(IGNORE_SELECTOR) !== null)
      ) {
        gesture = null;
        return;
      }
      gesture = {
        startX: touch.clientX,
        startY: touch.clientY,
        lastX: touch.clientX,
        lastTime: event.timeStamp,
        velocity: 0,
        isLocked: false,
      };
    };

    const onMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!gesture || !touch) return;

      if (!gesture.isLocked && isGesturesLocked()) {
        gesture = null;
        return;
      }

      const dt = event.timeStamp - gesture.lastTime;
      if (dt > 0) {
        const instant = (touch.clientX - gesture.lastX) / dt;
        gesture.velocity =
          gesture.velocity * (1 - VELOCITY_SMOOTHING) + instant * VELOCITY_SMOOTHING;
        gesture.lastX = touch.clientX;
        gesture.lastTime = event.timeStamp;
      }

      const deltaX = touch.clientX - gesture.startX;
      const deltaY = touch.clientY - gesture.startY;

      if (!gesture.isLocked) {
        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < AXIS_LOCK_DISTANCE) return;
        if (deltaX <= 0 || Math.abs(deltaX) <= Math.abs(deltaY)) {
          gesture = null;
          return;
        }
        gesture.isLocked = true;
        if (event.cancelable) event.preventDefault();
        lockTouchScroll();

        const target = targetRef?.current;
        if (!target) return;
        width = target.offsetWidth || window.innerWidth;
        gesture.startX = touch.clientX;
        target.style.willChange = 'transform';
        target.style.transition = 'none';
        progressHost = target.closest<HTMLElement>(PROGRESS_SCOPE_SELECTOR) ?? root;
        if (showBackdrop) setEdgeSwipeActive(true);
        return;
      }

      if (targetRef?.current) render(clamp(touch.clientX - gesture.startX, 0, width));
    };

    const onEnd = (event: TouchEvent) => {
      const active = gesture;
      gesture = null;
      const touch = event.changedTouches[0];
      if (!active || !active.isLocked || !touch) return;

      const dragged = Math.max(0, touch.clientX - active.startX);
      const velocity =
        event.timeStamp - active.lastTime > STALE_VELOCITY_MS ? 0 : active.velocity;
      const travel = width || window.innerWidth;
      const isFar = dragged >= travel * distanceRatio;
      const isFlick = dragged >= MIN_FLICK_DISTANCE && velocity >= FLICK_VELOCITY;
      const isReturning = velocity <= -FLICK_VELOCITY;
      const shouldClose =
        isEnabledRef.current && isTop() && !isReturning && (isFar || isFlick);

   if (!targetRef?.current) {
        if (shouldClose) {
          recoverFirstTap();
          onSwipeRef.current();
        }
        return;
      }

      if (shouldClose) commit(velocity);
      else settleBack();
    };

    const onCancel = () => {
      const wasLocked = gesture?.isLocked;
      gesture = null;
      if (wasLocked && targetRef?.current) settleBack();
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd, { passive: true });
    window.addEventListener('touchcancel', onCancel, { passive: true });
    return () => {
      const index = activeStack.indexOf(token);
      if (index !== -1) activeStack.splice(index, 1);
      cancelAnimationFrame(frame);
      window.clearTimeout(fallbackTimer);
      reset();
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onCancel);
    };

  }, [isActive, targetRef, showBackdrop, marksRouteCommit, zoneWidth, distanceRatio]);
}