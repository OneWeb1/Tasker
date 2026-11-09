import { ROUTE_PATHS } from '@/shared/config/routePaths';
import type { RoutePath } from '@/shared/config/routePaths';
import { getRouteOrigin } from '@/shared/lib/utils/routeOrigin';

export const getBackPath = (route: RoutePath, isDrawerOpen: boolean): RoutePath | null => {
  if (route === ROUTE_PATHS.profile) return ROUTE_PATHS.today;
  if (route === ROUTE_PATHS.notes) return getRouteOrigin(ROUTE_PATHS.notes) ?? ROUTE_PATHS.today;
  if (route === ROUTE_PATHS.settings) {
    if (isDrawerOpen) return ROUTE_PATHS.today;
    return getRouteOrigin(ROUTE_PATHS.settings) ?? ROUTE_PATHS.profile;
  }
  return null;
};