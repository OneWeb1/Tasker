import { ROUTE_PATHS } from '@/shared/config/routePaths';
import type { RoutePath } from '@/shared/config/routePaths';

const SWIPE_ORDER: readonly RoutePath[] = [ROUTE_PATHS.today, ROUTE_PATHS.projects];

interface SwipeNeighbors {
  previous: RoutePath | null;
  next: RoutePath | null;
}

   export const getSwipeNeighbors = (route: RoutePath): SwipeNeighbors => {
     const index = SWIPE_ORDER.indexOf(route);
     if (index === -1) return { previous: null, next: null };

     const isToday = route === ROUTE_PATHS.today;
     return {
       previous: SWIPE_ORDER[index - 1] ?? null,
       next: isToday ? null : (SWIPE_ORDER[index + 1] ?? null),
     };
   };