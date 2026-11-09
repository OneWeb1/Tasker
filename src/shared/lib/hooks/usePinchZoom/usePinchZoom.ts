import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Transform {
  scale: number;
  x: number;
  y: number;
}

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_SCALE = 5;
const ZOOM_ANIMATION_MS = 320;
const ZOOM_EASING = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
const ZOOM_EPSILON = 0.02;
const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

const limit = (value: number, bound: number) => Math.min(Math.max(value, -bound), bound);

export function usePinchZoom<T extends HTMLElement>() {
  const targetRef = useRef<T>(null);
  const [transform, setTransform] = useState<Transform>(IDENTITY);
  const current = useRef<Transform>(IDENTITY);
  const pointers = useRef(new Map<number, Point>());
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);
  const lastTapAt = useRef(0);
  const animationTimer = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const stopAnimation = useCallback(() => {
    if (animationTimer.current !== null) window.clearTimeout(animationTimer.current);
    animationTimer.current = null;
    setIsAnimating(false);
  }, []);

  const startAnimation = useCallback(() => {
    if (animationTimer.current !== null) window.clearTimeout(animationTimer.current);
    setIsAnimating(true);
    animationTimer.current = window.setTimeout(() => {
      animationTimer.current = null;
      setIsAnimating(false);
    }, ZOOM_ANIMATION_MS + 30);
  }, []);

  useEffect(
    () => () => {
      if (animationTimer.current !== null) window.clearTimeout(animationTimer.current);
    },
    [],
  );

  const apply = useCallback((next: Transform) => {
    const scale = Math.min(Math.max(next.scale, MIN_SCALE), MAX_SCALE);
    let result = IDENTITY;
    if (scale > MIN_SCALE) {
      const element = targetRef.current;
      const boundX = element ? (element.offsetWidth * (scale - 1)) / 2 : 0;
      const boundY = element ? (element.offsetHeight * (scale - 1)) / 2 : 0;
      result = { scale, x: limit(next.x, boundX), y: limit(next.y, boundY) };
    }
    current.current = result;
    setTransform(result);
  }, []);

  const reset = useCallback(() => apply(IDENTITY), [apply]);

  const zoomAround = useCallback(
    (focus: Point, scale: number) => {
      const element = targetRef.current;
      if (!element) return;
      const previous = current.current;
      const rect = element.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2 - previous.x,
        y: rect.top + rect.height / 2 - previous.y,
      };
      const ratio = scale / previous.scale;
      apply({
        scale,
        x: focus.x - center.x - ratio * (focus.x - center.x - previous.x),
        y: focus.y - center.y - ratio * (focus.y - center.y - previous.y),
      });
    },
    [apply],
  );

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.current.size === 2) {
        const [first, second] = [...pointers.current.values()];
        pinchStart.current = {
          distance: distance(first, second),
          scale: current.current.scale,
        };
        lastTapAt.current = 0;
        stopAnimation();
        return;
      }

      const now = Date.now();
      if (now - lastTapAt.current < DOUBLE_TAP_MS) {
        lastTapAt.current = 0;
        startAnimation();
        if (current.current.scale > MIN_SCALE) reset();
        else zoomAround({ x: event.clientX, y: event.clientY }, DOUBLE_TAP_SCALE);
        return;
      }
      lastTapAt.current = now;
    },
    [reset, startAnimation, stopAnimation, zoomAround],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const previous = pointers.current.get(event.pointerId);
      if (!previous) return;
      const next = { x: event.clientX, y: event.clientY };
      pointers.current.set(event.pointerId, next);

      if (pointers.current.size === 2 && pinchStart.current) {
        const [first, second] = [...pointers.current.values()];
        const ratio = distance(first, second) / pinchStart.current.distance;
        zoomAround(midpoint(first, second), pinchStart.current.scale * ratio);
        return;
      }

      if (pointers.current.size === 1 && current.current.scale > MIN_SCALE) {
        apply({
          scale: current.current.scale,
          x: current.current.x + next.x - previous.x,
          y: current.current.y + next.y - previous.y,
        });
      }
    },
    [apply, zoomAround],
  );

  const onPointerEnd = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      pointers.current.delete(event.pointerId);
      if (pointers.current.size < 2) pinchStart.current = null;
      if (current.current.scale < MIN_SCALE + ZOOM_EPSILON) reset();
    },
    [reset],
  );

  return {
    targetRef,
    isZoomed: transform.scale > MIN_SCALE,
    style: {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
      transition: isAnimating ? `transform ${ZOOM_ANIMATION_MS}ms ${ZOOM_EASING}` : 'none',
    },
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
    },
  };
}