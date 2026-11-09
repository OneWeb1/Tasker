import { useCallback } from 'react';
import { buildNoteCopy, useCreateNoteMutation, useRemoveNotesMutation } from '@/entities/note';
import type { Note } from '@/entities/note';

const COPY_SUFFIX = ' (копія)';

export function useDuplicateNote() {
  const [createNote] = useCreateNoteMutation();
  const [removeNotes] = useRemoveNotesMutation();

  const duplicateNote = useCallback(
    (note: Note): Promise<Note | null> => {
      const title = note.title.trim();
      return createNote(
        buildNoteCopy(note, {
          title: title === '' ? '' : `${title}${COPY_SUFFIX}`,
          updatedAt: note.updatedAt,
        }),
      )
        .unwrap()
        .catch(() => null);
    },
    [createNote],
  );

  const undoDuplicate = useCallback(
    (id: string) => {
      void removeNotes([id]);
    },
    [removeNotes],
  );

  return { duplicateNote, undoDuplicate };
}