import { TaskFilterSheet } from '@/features/day/switchTab';
import type { DayTab } from '@/features/day/switchTab';
import { EventSourcesSheet } from '../EventSourcesSheet';
import { NotesSortSheet } from '../NotesSortSheet';

interface DayTabSettingsSheetProps {
  tab: DayTab;
  isOpen: boolean;
  dateKey: string;
  workspaceId: string;
  projectId: string | null;
  onClose: () => void;
}

export function DayTabSettingsSheet({
  tab,
  isOpen,
  dateKey,
  workspaceId,
  projectId,
  onClose,
}: DayTabSettingsSheetProps) {
  return (
    <>
      <TaskFilterSheet
        isOpen={isOpen && tab === 'tasks'}
        dateKey={dateKey}
        workspaceId={workspaceId}
        projectId={projectId}
        onClose={onClose}
      />
      <EventSourcesSheet isOpen={isOpen && tab === 'events'} onClose={onClose} />
      <NotesSortSheet isOpen={isOpen && tab === 'notes'} onClose={onClose} />
    </>
  );
}