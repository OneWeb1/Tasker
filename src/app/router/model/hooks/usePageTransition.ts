import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ROUTE_PATHS } from '@/shared/config/routePaths';
import type { RoutePath } from '@/shared/config/routePaths';
import { consumeEdgeSwipeCommit } from '@/shared/lib/hooks/useEdgeSwipe';
import { getRouteMotion } from '../lib/getRouteMotion';
import type { RouteMotion } from '../lib/getRouteMotion';

export interface PageTransition {
  from: RoutePath;
  fromPath: string;
  motion: RouteMotion | 'swipe';
  offset: number;
}

const SWIPE_NAV_MS = 400;

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function usePageTransition(route: RoutePath, path: string) {
  const [transition, setTransition] = useState<PageTransition | null>(null);
  const [baseScroll, setBaseScroll] = useState(0);
  const previousRoute = useRef(route);
  const previousPath = useRef(path);
  const scrollY = useRef(0);
  const savedScroll = useRef(new Map<RoutePath, number>());
  const swipeTimer = useRef(0);

  const finish = useCallback(() => setTransition(null), []);

  useEffect(() => () => window.clearTimeout(swipeTimer.current), []);

  useEffect(() => {
    scrollY.current = window.scrollY;
    const onScroll = () => {
      scrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useLayoutEffect(() => {
    const from = previousRoute.current;
    const fromPath = previousPath.current;
    previousPath.current = path;
    if (from === route) return;
    previousRoute.current = route;

    const motion = getRouteMotion(from, route);
    const fromScroll = scrollY.current;
    savedScroll.current.set(from, fromScroll);
    if (route === ROUTE_PATHS.task) setBaseScroll(fromScroll);

    window.scrollTo(0, motion === 'push' ? 0 : (savedScroll.current.get(route) ?? 0));
    scrollY.current = window.scrollY;

    const isSwipeClose = consumeEdgeSwipeCommit();
    window.clearTimeout(swipeTimer.current);

    if (prefersReducedMotion()) {
      setTransition(null);
      return;
    }

    if (isSwipeClose) {
      setTransition({ from, fromPath, motion: 'swipe', offset: 0 });
      swipeTimer.current = window.setTimeout(finish, SWIPE_NAV_MS);
      return;
    }

    setTransition({ from, fromPath, motion, offset: window.scrollY - fromScroll });
  }, [route, path, finish]);

  return { transition, finish, baseScroll };
}