import { DEFAULT_NOTE_TAG, collectNoteTags, isSameNoteTag, useGetNotesQuery } from '@/entities/note';
import { useGetProjectsQuery } from '@/entities/project';
import { filterByWorkspace } from '@/entities/workspace';

export function useNoteImportContext(workspaceId: string) {
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: notes = [] } = useGetNotesQuery();

  return {
    projects: filterByWorkspace(projects, workspaceId),
    existingTags: collectNoteTags(filterByWorkspace(notes, workspaceId)).filter(
      (tag) => !isSameNoteTag(tag, DEFAULT_NOTE_TAG),
    ),
  };
}