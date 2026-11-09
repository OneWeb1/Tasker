import { useCallback, useState } from 'react';
import { replaceNoteFragment, useUpdateNoteMutation } from '@/entities/note';
import type { Note, NoteFragment } from '@/entities/note';
import {
  FRAGMENT_NOT_FOUND_MESSAGE,
  FRAGMENT_SAVE_ERROR_MESSAGE,
} from '../constants/noteFragment';

export function useEditNoteFragment(note: Note, fragment: NoteFragment, onApplied: () => void) {
  const [updateNote, { isLoading }] = useUpdateNoteMutation();
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const save = useCallback(
    async (replacement: string) => {
      if (replacement === fragment.text) {
        onApplied();
        return;
      }

      const content = replaceNoteFragment(note.content, fragment, replacement);
      if (content === null) {
        setError(FRAGMENT_NOT_FOUND_MESSAGE);
        return;
      }

      try {
        await updateNote({ id: note.id, patch: { content, updatedAt: Date.now() } }).unwrap();
        onApplied();
      } catch {
        setError(FRAGMENT_SAVE_ERROR_MESSAGE);
      }
    },
    [fragment, note.content, note.id, onApplied, updateNote],
  );

  return { error, isSubmitting: isLoading, save, clearError };
}