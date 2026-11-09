import { ROUTE_PATHS, resolveRoutePath } from '@/shared/config/routePaths';
import { useHashPath } from '@/shared/lib/hooks/useHashPath';
import { useOperationsScreen } from '../../model/hooks/useOperationsScreen';
import { useTaskOperations } from '../../model/hooks/useTaskOperations';
import { TaskOperationsScreen } from '../TaskOperationsScreen';

export function TaskOperationsHost() {
  const { screen, close } = useOperationsScreen();
  const { groups, totalMs, resolveCategory, openTask } = useTaskOperations(screen.range);
  const [path] = useHashPath();
  const isTaskOpen = resolveRoutePath(path) === ROUTE_PATHS.task;

  return (
    <TaskOperationsScreen
      isOpen={screen.isOpen}
      periodLabel={screen.periodLabel}
      range={screen.range}
      groups={groups}
      totalMs={totalMs}
      resolveCategory={resolveCategory}
      isScrollLocked={!isTaskOpen}
      onOpenTask={openTask}
      onClose={close}
    />
  );
}