import { useCallback, useMemo, useState } from 'react';
import type { Note } from '@/entities/note';

export function useOpenedNote(notes: readonly Note[]) {
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const openedNote = useMemo(
    () => notes.find((note) => note.id === openedId) ?? null,
    [notes, openedId],
  );

  const openNote = useCallback((note: Note) => {
    setOpenedId(note.id);
    setIsNoteOpen(true);
  }, []);

  const closeNote = useCallback(() => setIsNoteOpen(false), []);

  return { openedNote, isNoteOpen, openNote, closeNote };
}