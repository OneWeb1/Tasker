import { useCallback } from 'react';
import type { RoutePath } from '@/shared/config/routePaths';
import { useEdgeSwipe } from '@/shared/lib/hooks/useEdgeSwipe';
import { useHashPath } from '@/shared/lib/hooks/useHashPath';
import { forgetRouteOrigin } from '@/shared/lib/utils/routeOrigin';
import { getBackPath } from '../lib/getBackPath';
import { useNavDrawerOpen } from './useNavDrawerOpen';

export function useRouteBackSwipe(route: RoutePath) {
  const [, navigate] = useHashPath();
  const isDrawerOpen = useNavDrawerOpen();
  const backPath = getBackPath(route, isDrawerOpen);

  const goBack = useCallback(() => {
    if (backPath === null) return;
    navigate(backPath);
    forgetRouteOrigin(route);
  }, [backPath, navigate, route]);

  useEdgeSwipe({ onSwipe: goBack, isEnabled: backPath !== null });
}