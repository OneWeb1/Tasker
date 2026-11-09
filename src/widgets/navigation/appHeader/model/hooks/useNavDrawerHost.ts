   import { useCallback, useEffect } from 'react';
   import { ROUTE_PATHS } from '@/shared/config/routePaths';
import type { RoutePath } from '@/shared/config/routePaths';
import { useHashPath } from '@/shared/lib/hooks/useHashPath';
import { setNavDrawerOpen } from '../lib/navDrawerStore';
import { useNavDrawerOpen } from './useNavDrawerOpen';

export function useNavDrawerHost(route: RoutePath) {
   const [, navigate] = useHashPath();
   const isStoreOpen = useNavDrawerOpen();
  const isDrawerRoute = route === ROUTE_PATHS.today || route === ROUTE_PATHS.settings;

  useEffect(() => {
    if (!isDrawerRoute) setNavDrawerOpen(false);
  }, [isDrawerRoute]);

   const close = useCallback(() => setNavDrawerOpen(false), []);

  const openProfile = useCallback(() => {
    setNavDrawerOpen(false);
    navigate(ROUTE_PATHS.profile);
  }, [navigate]);

  const openSettings = useCallback(() => {
    navigate(ROUTE_PATHS.settings);
  }, [navigate]);

  return {
    isOpen: isStoreOpen && isDrawerRoute,
   isCovered: route === ROUTE_PATHS.settings,
   close,
    openProfile,
    openSettings,
  };
}