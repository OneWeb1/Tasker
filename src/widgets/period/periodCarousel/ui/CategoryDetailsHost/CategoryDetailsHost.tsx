import type { CSSProperties } from 'react';
import { getPeriodStyle } from '@/entities/period';
import { buildTaskPath } from '@/shared/config/routePaths';
import { ROUTE_PATHS, resolveRoutePath } from '@/shared/config/routePaths';
import { useHashPath } from '@/shared/lib/hooks/useHashPath';
import { PERIOD_SCREEN_BACKDROP } from '../../model/constants/screenBackdrop';
import { useCategoryScreen } from '../../model/hooks/useCategoryScreen';
import { CategoryDetailsScreen } from '../CategoryDetailsScreen';

export function CategoryDetailsHost() {
  const { screen, close } = useCategoryScreen();
  const [path, navigate] = useHashPath();
  const isTaskOpen = resolveRoutePath(path) === ROUTE_PATHS.task;

  if (!screen.period) return null;

  const surfaceStyle = {
    ...getPeriodStyle(screen.period),
    '--screen-bg': PERIOD_SCREEN_BACKDROP,
  } as CSSProperties;

  return (
    <CategoryDetailsScreen
      isOpen={screen.isOpen}
      category={screen.category}
      from={screen.period.startDate}
      to={screen.period.endDate}
      periodLabel={screen.periodLabel}
      surfaceStyle={surfaceStyle}
      isScrollLocked={!isTaskOpen}
      onOpenTask={(taskId) => navigate(buildTaskPath(taskId))}
      onClose={close}
    />
  );
}