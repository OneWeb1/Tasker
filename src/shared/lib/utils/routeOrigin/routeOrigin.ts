import type { RoutePath } from '@/shared/config/routePaths';

const origins = new Map<RoutePath, RoutePath>();

export const rememberRouteOrigin = (route: RoutePath, origin: RoutePath): void => {
  origins.set(route, origin);
};

export const getRouteOrigin = (route: RoutePath): RoutePath | undefined => origins.get(route);

export const forgetRouteOrigin = (route: RoutePath): void => {
  origins.delete(route);
};