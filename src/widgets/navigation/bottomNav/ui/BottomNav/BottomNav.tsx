import type { ComponentType, SVGProps } from 'react';
import { ROUTE_PATHS } from '@/shared/config/routePaths';
import type { RoutePath } from '@/shared/config/routePaths';
import { NavFab } from '@/shared/ui/NavFab';
import { NavItem } from '@/shared/ui/NavItem';
import { AppsIcon, NotesIcon, ProjectsIcon, TodayIcon } from '@/shared/ui/icons';
import { useBottomNav } from '../../model/hooks/useBottomNav';
import type { NavPath } from '../../model/hooks/useBottomNav';
import { CreateItemSheet } from '../CreateItemSheet';
import { MoreSheet } from '../MoreSheet';
import { PlanImportScreen } from '../PlanImportScreen';
import styles from './BottomNav.module.css';

type NavIconComponent = ComponentType<SVGProps<SVGSVGElement> & { filled?: boolean }>;

const ICONS: Record<NavPath, NavIconComponent> = {
  [ROUTE_PATHS.today]: TodayIcon,
  [ROUTE_PATHS.notes]: NotesIcon,
  [ROUTE_PATHS.projects]: ProjectsIcon,
};

interface BottomNavProps {
  route: RoutePath;
  role?: 'enter' | 'exit' | 'backdrop';
}

export function BottomNav({ route, role }: BottomNavProps) {
  const {
    items,
    activePath,
    isMoreOpen,
    isCreateOpen,
    activeWorkspace,
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
  } = useBottomNav(route);

  const renderItem = (item: { path: NavPath; label: string }) => {
    const Icon = ICONS[item.path];
    const isActive = item.path === activePath;

    return (
      <NavItem
        key={item.path}
        label={item.label}
        icon={<Icon filled={isActive} />}
        isActive={isActive}
        onClick={() => navigate(item.path)}
      />
    );

  };

  return (
    <>
      <nav
        className={styles.nav}
        aria-label="Головна навігація"
        data-role={role}
        aria-hidden={role === 'exit' || role === 'backdrop' || undefined}
      >
        <div className={styles.pill}>
          {items.map(renderItem)}
          <NavItem
            label="Ще"
            icon={<AppsIcon filled={false} />}
            isActive={false}
            onClick={openMore}
          />
        </div>
        <NavFab label="Додати" onClick={openCreate} />
      </nav>
      {role !== 'exit' && (
        <>
          <CreateItemSheet
            isOpen={isCreateOpen}
            onClose={closeCreate}
            onSelect={createItem}
            onImportPlan={openPlan}
          />
          <PlanImportScreen
            isOpen={isPlanOpen}
            activeWorkspace={activeWorkspace}
            onClose={closePlan}
            onImported={finishPlanImport}
          />
          <MoreSheet
            isOpen={isMoreOpen}
            onClose={closeMore}
            onOpenProfile={openProfile}
            onOpenSettings={openSettings}
          />
        </>
      )}
    </>
  );
}