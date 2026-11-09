import { useCallback, useMemo } from 'react';
import {
  compareNotesNewestFirst,
  isNoteArchived,
  isNoteLinkedToTask,
  linkNoteToTask,
  unlinkNoteFromTask,
  useGetNotesQuery,
  useUpdateNoteMutation,
} from '@/entities/note';
import type { Note } from '@/entities/note';
import { filterByWorkspace } from '@/entities/workspace';

export function useNoteTaskLinks(taskId: string, workspaceId: string) {
  const { data: notes = [] } = useGetNotesQuery();
  const [updateNote] = useUpdateNoteMutation();

  const linked = useMemo<Note[]>(
    () => notes.filter((note) => isNoteLinkedToTask(note, taskId)).sort(compareNotesNewestFirst),
    [notes, taskId],
  );

  const candidates = useMemo<Note[]>(
    () =>
      filterByWorkspace(notes, workspaceId)
        .filter((note) => !isNoteArchived(note) && !isNoteLinkedToTask(note, taskId))
        .sort(compareNotesNewestFirst),
    [notes, taskId, workspaceId],
  );

  const link = useCallback(
    (noteId: string) => {
      const note = notes.find((item) => item.id === noteId);
      if (note) void updateNote({ id: noteId, patch: { taskIds: linkNoteToTask(note, taskId) } });
    },
    [notes, taskId, updateNote],
  );

  const unlink = useCallback(
    (noteId: string) => {
      const note = notes.find((item) => item.id === noteId);
      if (note) void updateNote({ id: noteId, patch: { taskIds: unlinkNoteFromTask(note, taskId) } });
    },
    [notes, taskId, updateNote],
  );

  return { linked, candidates, link, unlink };
}