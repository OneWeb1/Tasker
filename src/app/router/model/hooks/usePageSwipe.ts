import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { RoutePath } from '@/shared/config/routePaths';
import { markEdgeSwipeCommitted, setEdgeSwipeActive } from '@/shared/lib/hooks/useEdgeSwipe';
import { animateValue } from '@/shared/lib/utils/animateValue';
import { easeOutCubic, easeOutQuad, prefersReducedMotion } from '@/shared/lib/utils/motion';
import { recoverFirstTap } from '@/shared/lib/utils/recoverFirstTap';
import { FALLBACK_MS, RETURN_MS } from '../constants/pageSwipe';
import { getCommitDuration } from '../lib/pageSwipeDecision';
import type { SwipeDirection } from '../lib/pageSwipeDecision';
import { renderPageSwipe, resetPageSwipe } from '../lib/pageSwipeView';
import type { PageSwipeView } from '../lib/pageSwipeView';
import { usePageSwipeGesture } from './usePageSwipeGesture';

interface UsePageSwipeOptions {
  route: RoutePath;
  stageRef: RefObject<HTMLElement | null>;
  previousRoute: RoutePath | null;
  nextRoute: RoutePath | null;
  onNavigate: (route: RoutePath) => void;
}

export function usePageSwipe({
  route,
  stageRef,
  previousRoute,
  nextRoute,
  onNavigate,
}: UsePageSwipeOptions) {
  const [peek, setPeek] = useState<RoutePath | null>(null);
  const viewRef = useRef<PageSwipeView>({ offset: 0, width: 0, direction: 1 });
  const onNavigateRef = useRef(onNavigate);
  const cancelAnimationRef = useRef<(() => void) | null>(null);
  const timerRef = useRef(0);
  const isBusyRef = useRef(false);
  const isActiveRef = useRef(false);

  useEffect(() => {
    onNavigateRef.current = onNavigate;
  }, [onNavigate]);

  const render = useCallback(
    (offset: number) => {
      viewRef.current.offset = offset;
      const stage = stageRef.current;
      if (stage) renderPageSwipe(stage, viewRef.current);
    },
    [stageRef],
  );

  const clear = useCallback(() => {
    viewRef.current.offset = 0;
    const stage = stageRef.current;
    if (stage) resetPageSwipe(stage);
    if (isActiveRef.current) {
      isActiveRef.current = false;
      setEdgeSwipeActive(false);
    }
    setPeek(null);
  }, [stageRef]);

  const stopMotion = useCallback(() => {
    cancelAnimationRef.current?.();
    cancelAnimationRef.current = null;
    window.clearTimeout(timerRef.current);
  }, []);

  const finish = useCallback(() => {
    isBusyRef.current = false;
    clear();
  }, [clear]);

  const animateTo = useCallback(
    (to: number, duration: number, ease: (t: number) => number, onDone: () => void) => {
      cancelAnimationRef.current?.();
      cancelAnimationRef.current = animateValue({
        from: viewRef.current.offset,
        to,
        duration,
        ease,
        onUpdate: render,
        onDone,
      });
    },
    [render],
  );

  const settleBack = useCallback(() => {
    isBusyRef.current = true;
    animateTo(0, prefersReducedMotion() ? 0 : RETURN_MS, easeOutCubic, finish);
  }, [animateTo, finish]);

  const commit = useCallback(
    (target: RoutePath, direction: SwipeDirection, velocity: number) => {
      isBusyRef.current = true;
      const { width, offset } = viewRef.current;
      const remaining = Math.max(width - Math.abs(offset), 0);
      const duration = prefersReducedMotion() ? 0 : getCommitDuration(remaining, velocity);

      animateTo(direction * width, duration, easeOutQuad, () => {
        markEdgeSwipeCommitted();
        onNavigateRef.current(target);
        timerRef.current = window.setTimeout(finish, FALLBACK_MS);
      });
    },
    [animateTo, finish],
  );

  useLayoutEffect(() => {
    stopMotion();
    isBusyRef.current = false;
    clear();
  }, [route, stopMotion, clear]);

  useLayoutEffect(() => {
    if (peek) render(viewRef.current.offset);
  }, [peek, render]);

  useEffect(() => stopMotion, [stopMotion]);

  usePageSwipeGesture({
    isEnabled: previousRoute !== null || nextRoute !== null,
    canStart: () => !isBusyRef.current,
    getWidth: () => stageRef.current?.offsetWidth || window.innerWidth,
    resolveTarget: (direction) => (direction === 1 ? previousRoute : nextRoute),
    onLock: (direction, target, width) => {
      viewRef.current = { offset: 0, width, direction };
      isActiveRef.current = true;
      setEdgeSwipeActive(true);
      setPeek(target);
    },
    onDrag: render,
    onRelease: ({ target, direction, velocity, isCommit }) => {
      recoverFirstTap();
      if (isCommit) commit(target, direction, velocity);
      else settleBack();
    },
    onCancel: settleBack,
  });

  return { peek };
}