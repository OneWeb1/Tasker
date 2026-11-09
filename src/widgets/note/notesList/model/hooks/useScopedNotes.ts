import { useMemo } from 'react';
import { useGetNotesQuery } from '@/entities/note';
import type { Note } from '@/entities/note';
import { filterByWorkspace } from '@/entities/workspace';
import { useActiveProject } from '@/features/project/filterByProject';
import { useActiveWorkspace } from '@/features/workspace/switchWorkspace';

export function useScopedNotes(): Note[] {
  const { data: notes } = useGetNotesQuery();
  const { workspace } = useActiveWorkspace();
  const { activeProjectId } = useActiveProject();

  return useMemo(() => {
    const inWorkspace = filterByWorkspace(notes ?? [], workspace.id);
    if (activeProjectId === null) return inWorkspace;
    return inWorkspace.filter((note) => note.projectId === activeProjectId);
  }, [activeProjectId, notes, workspace.id]);
}