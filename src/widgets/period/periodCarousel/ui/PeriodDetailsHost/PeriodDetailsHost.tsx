import { ROUTE_PATHS, resolveRoutePath } from '@/shared/config/routePaths';
import { useHashPath } from '@/shared/lib/hooks/useHashPath';
import { usePeriodScreen } from '../../model/hooks/usePeriodScreen';
import { PeriodDetailsScreen } from '../PeriodDetailsScreen';

export function PeriodDetailsHost() {
  const { screen, close } = usePeriodScreen();
  const [path] = useHashPath();
  const isTaskOpen = resolveRoutePath(path) === ROUTE_PATHS.task;

  if (!screen.item) return null;

  return (
    <PeriodDetailsScreen
      isOpen={screen.isOpen}
      item={screen.item}
      isScrollLocked={!isTaskOpen}
      onClose={close}
    />
  );
}