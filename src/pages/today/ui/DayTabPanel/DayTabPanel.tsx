import type { DayTab } from '@/features/day/switchTab';
import { DayTimeline } from '@/widgets/day/dayTimeline';
import { TaskGroups } from '@/widgets/day/taskGroups';
import { NotesList } from '@/widgets/note/notesList';

interface DayTabPanelProps {
  tab: DayTab;
}

export function DayTabPanel({ tab }: DayTabPanelProps) {
  if (tab === 'events') return <DayTimeline />;
  if (tab === 'notes') return <NotesList />;
  return <TaskGroups />;
}