import { useCallback, useState } from 'react';
import type { NoteFragment } from '@/entities/note';

export function useNoteSelectionActions() {
  const [text, setText] = useState('');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [fragment, setFragment] = useState<NoteFragment | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const openAi = useCallback((selected: string) => {
    setText(selected);
    setIsAiOpen(true);
  }, []);

  const closeAi = useCallback(() => setIsAiOpen(false), []);

  const openEdit = useCallback((next: NoteFragment) => {
    setFragment(next);
    setIsEditOpen(true);
  }, []);

  const closeEdit = useCallback(() => setIsEditOpen(false), []);

  return { text, isAiOpen, openAi, closeAi, fragment, isEditOpen, openEdit, closeEdit };
}