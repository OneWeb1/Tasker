import { ROUTE_PATHS } from '@/shared/config/routePaths';
import type { RoutePath } from '@/shared/config/routePaths';

export type RouteMotion = 'push' | 'pop' | 'forward' | 'backward';

const TAB_ORDER: readonly RoutePath[] = [
  ROUTE_PATHS.today,
  ROUTE_PATHS.projects,
  ROUTE_PATHS.profile,
];

const getTabIndex = (route: RoutePath): number =>
  TAB_ORDER.indexOf(route === ROUTE_PATHS.settings ? ROUTE_PATHS.profile : route);

export const getRouteMotion = (from: RoutePath, to: RoutePath): RouteMotion => {
  if (to === ROUTE_PATHS.task) return 'push';
  if (from === ROUTE_PATHS.task) return 'pop';
  if (to === ROUTE_PATHS.settings) return 'push';
  if (from === ROUTE_PATHS.settings) return 'pop';
  if (to === ROUTE_PATHS.notes) return 'push';
  if (from === ROUTE_PATHS.notes) return 'pop';
  return getTabIndex(to) > getTabIndex(from) ? 'forward' : 'backward';
};