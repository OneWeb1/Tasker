import { useCallback, useState } from 'react';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
import { ROUTE_PATHS } from '@/shared/config/routePaths';
import type { RoutePath } from '@/shared/config/routePaths';
import { useHashPath } from '@/shared/lib/hooks/useHashPath';
import { forgetRouteOrigin } from '@/shared/lib/utils/routeOrigin';
import { getBackPath } from '../lib/getBackPath';
import { setNavDrawerOpen } from '../lib/navDrawerStore';
import { useNavDrawerOpen } from './useNavDrawerOpen';

const PAGE_TITLES: Record<RoutePath, string> = {
  [ROUTE_PATHS.today]: 'Сьогодні',
  [ROUTE_PATHS.notes]: 'Нотатки',
  [ROUTE_PATHS.projects]: 'Проєкти',
  [ROUTE_PATHS.profile]: 'Профіль',
  [ROUTE_PATHS.settings]: 'Налаштування',
  [ROUTE_PATHS.task]: 'Завдання',
};

export function useAppHeader(route: RoutePath) {
  const [, navigate] = useHashPath();
  const { workspace } = useActiveWorkspace();
  const isDrawerOpen = useNavDrawerOpen();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  const openWorkspaces = useCallback(() => setIsWorkspaceOpen(true), []);
  const closeWorkspaces = useCallback(() => setIsWorkspaceOpen(false), []);
  const openMenu = useCallback(() => setNavDrawerOpen(true), []);

  const openProfile = useCallback(() => {
    navigate(ROUTE_PATHS.profile);
  }, [navigate]);

  const backFromSettings = useCallback(() => {
    navigate(getBackPath(ROUTE_PATHS.settings, isDrawerOpen) ?? ROUTE_PATHS.today);
    forgetRouteOrigin(ROUTE_PATHS.settings);
  }, [isDrawerOpen, navigate]);

  return {
    workspace,
    isWorkspaceOpen,
    openWorkspaces,
    closeWorkspaces,
    openMenu,
    isWorkspaceVisible: route === ROUTE_PATHS.today,
    isProfilePage: route === ROUTE_PATHS.profile,
    isSettingsPage: route === ROUTE_PATHS.settings,
    isNotesPage: route === ROUTE_PATHS.notes,
    isOverDrawer: route === ROUTE_PATHS.settings && isDrawerOpen,
    pageTitle: PAGE_TITLES[route],
    openProfile,
    backFromSettings,
  };
}