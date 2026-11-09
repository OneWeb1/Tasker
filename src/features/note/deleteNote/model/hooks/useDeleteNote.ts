import { useCallback } from 'react';
import { useDeleteNoteMutation, useRestoreDeletedNoteMutation } from '@/entities/note';
import type { DeletedNote } from '@/entities/note';

export function useDeleteNote() {
  const [deleteNoteMutation] = useDeleteNoteMutation();
  const [restoreDeletedNote] = useRestoreDeletedNoteMutation();

  const deleteNote = useCallback(
    (id: string): Promise<DeletedNote | null> =>
      deleteNoteMutation(id)
        .unwrap()
        .catch(() => null),
    [deleteNoteMutation],
  );

  const undoDelete = useCallback(
    (snapshot: DeletedNote) => {
      void restoreDeletedNote(snapshot);
    },
    [restoreDeletedNote],
  );

  return { deleteNote, undoDelete };
}