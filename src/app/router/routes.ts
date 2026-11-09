import type { ComponentType } from 'react';
import { NotesPage } from '@/pages/notes';
import { ProfilePage } from '@/pages/profile';
import { ProjectsPage } from '@/pages/projects';
import { SettingsPage } from '@/pages/settings';
import { TaskPage } from '@/pages/task';
import { TodayPage } from '@/pages/today';
import { ROUTE_PATHS } from '@/shared/config/routePaths';
import type { RoutePath } from '@/shared/config/routePaths';

export interface RouteProps {
  path: string;
}

export const routes: Record<RoutePath, ComponentType<RouteProps>> = {
  [ROUTE_PATHS.today]: TodayPage,
  [ROUTE_PATHS.notes]: NotesPage,
  [ROUTE_PATHS.projects]: ProjectsPage,
  [ROUTE_PATHS.profile]: ProfilePage,
  [ROUTE_PATHS.settings]: SettingsPage,
  [ROUTE_PATHS.task]: TaskPage,
};