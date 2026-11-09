import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSelectedDate } from '@/features/day/selectDate';
import { DayTabScreenHost } from '@/pages/today';
import { ROUTE_PATHS, parseSubtaskId, resolveRoutePath } from '@/shared/config/routePaths';
import type { RoutePath } from '@/shared/config/routePaths';
import { useHashPath } from '@/shared/lib/hooks/useHashPath';
import { ScreenPortalContext } from '@/shared/lib/hooks/useScreenPortal';
import { DaySearchScreen } from '@/widgets/day/daySearch';
import { AppHeader, NavDrawerHost, useNavDrawerOpen } from '@/widgets/navigation/appHeader';
import { BottomNav } from '@/widgets/navigation/bottomNav';
import {
  CategoryDetailsHost,
  PeriodDetailsHost,
  useHasOverlayScreen,
} from '@/widgets/period/periodCarousel';
import { TaskOperationsHost } from '@/widgets/task/taskOperations';
import { TaskEditorScreen } from '@/widgets/task/taskScreen';
import { usePageSwipe } from './model/hooks/usePageSwipe';
import { usePageTransition } from './model/hooks/usePageTransition';
import { getSwipeNeighbors } from './model/lib/getSwipeNeighbors';
import { routes } from './routes';
import styles from './AppRouter.module.css';

interface RouteLayerProps {
  route: RoutePath;
  path: string;
  isDrawerOpen: boolean;
  isExiting?: boolean;
  isBackdrop?: boolean;
  isPeek?: boolean;
  offset?: number;
  scrollOffset?: number;
  onExited?: () => void;
}

const ROUTES_WITHOUT_NAV: readonly RoutePath[] = [
  ROUTE_PATHS.profile,
  ROUTE_PATHS.settings,
  ROUTE_PATHS.task,
];
const FULLSCREEN_ROUTES: readonly RoutePath[] = [ROUTE_PATHS.task];

const hasRouteNav = (route: RoutePath): boolean => !ROUTES_WITHOUT_NAV.includes(route);
const isFullscreenRoute = (route: RoutePath): boolean => FULLSCREEN_ROUTES.includes(route);

function RouteLayer({
  route,
  path,
  isDrawerOpen,
  isExiting = false,
  isBackdrop = false,
  isPeek = false,
  offset = 0,
  scrollOffset = 0,
  onExited,
}: RouteLayerProps) {
  const Page = routes[route];
  const layerRef = useRef<HTMLDivElement>(null);
  const isEnterLayer = !isExiting && !isBackdrop && !isPeek;

  useLayoutEffect(() => {
    if (isBackdrop && layerRef.current) layerRef.current.scrollTop = scrollOffset;
  }, [isBackdrop, scrollOffset]);

  return (
    <div
      ref={layerRef}
      role={isExiting || isBackdrop || isPeek ? undefined : 'main'}
      className={styles.layer}
      data-role={isBackdrop ? 'backdrop' : isPeek ? 'peek' : isExiting ? 'exit' : 'enter'}
      data-with-nav={hasRouteNav(route)}
      data-fullscreen={isFullscreenRoute(route)}
      data-over-drawer={(route === ROUTE_PATHS.settings && isDrawerOpen) || undefined}
      data-shift-below={(isEnterLayer && isFullscreenRoute(route)) || undefined}
      aria-hidden={isExiting || isBackdrop || isPeek || undefined}
      style={isExiting ? { top: offset } : undefined}
      onAnimationEnd={
        isExiting
          ? (event) => {
              if (event.target === event.currentTarget) onExited?.();
            }
          : undefined
      }
    >
      {!(isExiting && parseSubtaskId(path)) && <Page path={path} />}
    </div>
  );
}

export function AppRouter() {
  const [path, navigate] = useHashPath();
   const { selectedDate } = useSelectedDate();
   const stageRef = useRef<HTMLDivElement>(null);
  const isDrawerOpen = useNavDrawerOpen();
  const hasOverlay = useHasOverlayScreen();
  const route = resolveRoutePath(path);
  const baseRoute = useRef<RoutePath>(ROUTE_PATHS.today);
  if (route !== ROUTE_PATHS.task) baseRoute.current = route;
  const [isBackdropReady, setIsBackdropReady] = useState(false);
  const [screensNode, setScreensNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (route !== ROUTE_PATHS.task) {
      setIsBackdropReady(false);
      return;
    }
    const timer = window.setTimeout(() => setIsBackdropReady(true), 350);
    const prepare = () => setIsBackdropReady(true);
    window.addEventListener('touchstart', prepare, { passive: true, once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('touchstart', prepare);
    };
  }, [route]);
  const { transition, finish, baseScroll } = usePageTransition(route, path);
   const { previous, next } = getSwipeNeighbors(route);
  const { peek } = usePageSwipe({
    route,
    stageRef,
    previousRoute: previous,
    nextRoute: next,
    onNavigate: navigate,
  });

  const hasNav = hasRouteNav(route);
  const isNavEntering = hasNav && transition !== null && !hasRouteNav(transition.from);
  const isExitNavVisible = !hasNav && transition !== null && hasRouteNav(transition.from);
  const isChromeBackdrop = route === ROUTE_PATHS.task && isBackdropReady;
  const chromeRoute = isChromeBackdrop ? baseRoute.current : route;
  const isHeaderShown = isChromeBackdrop || !isFullscreenRoute(route);
  const isNavShown = hasRouteNav(chromeRoute);

  return (
    <div className={styles.shell}>
      <TaskOperationsHost />
      <PeriodDetailsHost />
      <DayTabScreenHost />
      <CategoryDetailsHost />
      <DaySearchScreen />
      <div
        ref={stageRef}
        className={styles.stage}
        data-motion={transition?.motion}
        data-edge-swipe-scope
        data-overlay={hasOverlay || undefined}
      >
        {peek && (
          <RouteLayer key="peek" route={peek} path={peek} isDrawerOpen={false} isPeek />
        )}
        {route === ROUTE_PATHS.task && isBackdropReady && (
          <RouteLayer
            key="base"
            route={baseRoute.current}
            path={baseRoute.current}
            isDrawerOpen={false}
            isBackdrop
            scrollOffset={baseScroll}
          />
        )}
        {transition && transition.motion !== 'swipe' && (
          <RouteLayer
            key="exit"
            route={transition.from}
            path={transition.fromPath}
            isDrawerOpen={isDrawerOpen}
            isExiting
            offset={transition.offset}
            onExited={finish}
          />
        )}
        <ScreenPortalContext.Provider value={screensNode}>
          <RouteLayer
            key={route === ROUTE_PATHS.task ? route : 'base'}
            route={route}
            path={path}
            isDrawerOpen={isDrawerOpen}
          />
        </ScreenPortalContext.Provider>
        <div ref={setScreensNode} className={styles.screens} />
        {transition && transition.motion !== 'swipe' && !isFullscreenRoute(transition.from) && (
          <AppHeader key="exit-header" route={transition.from} role="exit" />
        )}
        {isHeaderShown && (
          <AppHeader
            key={`header-${chromeRoute}`}
            route={chromeRoute}
            role={isChromeBackdrop ? 'backdrop' : undefined}
          />
        )}
        {peek && <AppHeader key="peek-header" route={peek} role="peek" />}
        {isExitNavVisible && <BottomNav key="exit-nav" route={transition.from} role="exit" />}
        {isNavShown && (
          <BottomNav
            key="nav"
            route={chromeRoute}
            role={isChromeBackdrop ? 'backdrop' : isNavEntering ? 'enter' : undefined}
          />
        )}
      </div>
      <TaskEditorScreen defaultDate={selectedDate} />
      <NavDrawerHost route={route} />
    </div>
  );
}