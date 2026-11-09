import { useMemo } from 'react';
import { useSelectedDate } from '@/features/day/selectDate';
import { DayTabs } from '@/features/day/switchTab';
import type { DayTab } from '@/features/day/switchTab';
import { useActiveProject } from '@/features/project/filterByProject';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';
import { useDayEventsCount } from '@/widgets/day/dayTimeline';
import { useNotesCount } from '@/widgets/note/notesList';
import type { PeriodSelection } from '@/widgets/period/periodCarousel';
import { TaskOperations } from '@/widgets/task/taskOperations';

interface PeriodContentProps {
  selection: PeriodSelection;
  onOpen: (tab: DayTab) => void;
}

export function PeriodContent({ selection, onOpen }: PeriodContentProps) {
  const { selectedDate } = useSelectedDate();
  const { workspace } = useActiveWorkspace();
  const { activeProjectId } = useActiveProject();
  const range = useMemo(
    () => ({ from: selection.from, to: selection.to }),
    [selection.from, selection.to],
  );
  const eventsCount = useDayEventsCount(range);
  const notesCount = useNotesCount(range);

  return (
    <>
      <DayTabs
        dateKey={selectedDate}
        workspaceId={workspace.id}
        projectId={activeProjectId}
        range={range}
        eventsCount={eventsCount}
        notesCount={notesCount}
        onOpen={onOpen}
      />
      <TaskOperations range={range} periodLabel={selection.label} />
    </>
  );
}