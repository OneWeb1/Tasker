import { useCallback, useEffect, useRef, useState } from 'react';
import { useCreateItem } from '@/features/createItem';
import type { CreateItemKind } from '@/features/createItem';
import { useSelectedDate } from '@/features/day/selectDate';
import { useActiveProject } from '@/features/project/filterByProject';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
import { ROUTE_PATHS } from '@/shared/config/routePaths';
import type { RoutePath } from '@/shared/config/routePaths';
import { useHashPath } from '@/shared/lib/hooks/useHashPath';
import { getTodayKey } from '@/shared/lib/utils/date';
import { rememberRouteOrigin } from '@/shared/lib/utils/routeOrigin';

export type NavPath = typeof ROUTE_PATHS.today | typeof ROUTE_PATHS.notes | typeof ROUTE_PATHS.projects;

interface NavEntry {
  path: NavPath;
  label: string;
}

const SHEET_EXIT_MS = 150;

const NAV_ITEMS: readonly NavEntry[] = [
  { path: ROUTE_PATHS.today, label: 'Сьогодні' },
  { path: ROUTE_PATHS.notes, label: 'Нотатки' },
  { path: ROUTE_PATHS.projects, label: 'Проєкти' },
];

export function useBottomNav(route: RoutePath) {
  const [, navigateToPath] = useHashPath();
  const { selectDate } = useSelectedDate();
  const { open } = useCreateItem();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const { workspace, switchWorkspace } = useActiveWorkspace();
  const { clearProject } = useActiveProject();
  const navigateTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(navigateTimer.current), []);

  const navigate = useCallback(
    (target: NavPath) => {
      if (target === ROUTE_PATHS.today) selectDate(getTodayKey());
      if (target === ROUTE_PATHS.notes) rememberRouteOrigin(ROUTE_PATHS.notes, route);
      navigateToPath(target);
    },
    [navigateToPath, route, selectDate],
  );

  const goTo = useCallback(
    (target: RoutePath) => {
      setIsMoreOpen(false);
      window.clearTimeout(navigateTimer.current);
      navigateTimer.current = window.setTimeout(() => navigateToPath(target), SHEET_EXIT_MS);
    },
    [navigateToPath],
  );

  const openCreate = useCallback(() => setIsCreateOpen(true), []);
  const closeCreate = useCallback(() => setIsCreateOpen(false), []);

  const openPlan = useCallback(() => {
    setIsCreateOpen(false);
    setIsPlanOpen(true);
  }, []);
  const closePlan = useCallback(() => setIsPlanOpen(false), []);

  const finishPlanImport = useCallback(
    (workspaceId: string) => {
      if (workspaceId !== workspace.id) clearProject();
      switchWorkspace(workspaceId);
      setIsPlanOpen(false);
    },
    [clearProject, switchWorkspace, workspace.id],
  );

  const createItem = useCallback(
    (kind: CreateItemKind) => {
      setIsCreateOpen(false);
      open({ kind });
    },
    [open],
  );

  const openMore = useCallback(() => setIsMoreOpen(true), []);
  const closeMore = useCallback(() => setIsMoreOpen(false), []);
  const openProfile = useCallback(() => goTo(ROUTE_PATHS.profile), [goTo]);
  const openSettings = useCallback(() => {
    rememberRouteOrigin(ROUTE_PATHS.settings, ROUTE_PATHS.today);
    goTo(ROUTE_PATHS.settings);
  }, [goTo]);

  return {
    items: NAV_ITEMS,
    activePath: NAV_ITEMS.find((item) => item.path === route)?.path ?? null,
    isMoreOpen,
    isCreateOpen,
    activeWorkspace: workspace,
    isPlanOpen,
    openPlan,
    closePlan,
    finishPlanImport,
    navigate,
    openCreate,
    closeCreate,
    createItem,
    openMore,
    closeMore,
    openProfile,
    openSettings,
  };
}