import { useSelectedDate } from '@/features/day/selectDate';
import { useActiveProject } from '@/features/project/filterByProject';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
import { ROUTE_PATHS, resolveRoutePath } from '@/shared/config/routePaths';
import { useHashPath } from '@/shared/lib/hooks/useHashPath';
import { useDayTabScreen } from '../../model/hooks/useDayTabScreen';
import { DayTabScreen } from '../DayTabScreen';

export function DayTabScreenHost() {
  const { screen, close } = useDayTabScreen();
  const { selectedDate } = useSelectedDate();
  const { workspace } = useActiveWorkspace();
  const { activeProjectId } = useActiveProject();
  const [path] = useHashPath();
  const isTaskOpen = resolveRoutePath(path) === ROUTE_PATHS.task;

  return (
    <DayTabScreen
      tab={screen.tab}
      isOpen={screen.isOpen}
      dateKey={selectedDate}
      workspaceId={workspace.id}
      projectId={activeProjectId}
      range={screen.range}
      isScrollLocked={!isTaskOpen}
      onClose={close}
    />
  );
}