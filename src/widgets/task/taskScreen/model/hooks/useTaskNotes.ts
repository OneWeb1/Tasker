import { useCallback, useMemo, useState } from 'react';
import { useNoteTaskLinks } from '@/features/note/linkTasks';

export function useTaskNotes(taskId: string, workspaceId: string) {
  const { linked, candidates, link, unlink } = useNoteTaskLinks(taskId, workspaceId);
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const openedNote = useMemo(
    () => linked.find((note) => note.id === openedId) ?? null,
    [linked, openedId],
  );

  const openNote = useCallback((id: string) => {
    setOpenedId(id);
    setIsNoteOpen(true);
  }, []);

  const closeNote = useCallback(() => setIsNoteOpen(false), []);
  const openPicker = useCallback(() => setIsPickerOpen(true), []);
  const closePicker = useCallback(() => setIsPickerOpen(false), []);

  const pickNote = useCallback(
    (noteId: string) => {
      link(noteId);
      setIsPickerOpen(false);
    },
    [link],
  );

  return {
    linked,
    candidates,
    openedNote,
    isNoteOpen,
    isPickerOpen,
    openNote,
    closeNote,
    openPicker,
    closePicker,
    pickNote,
    unlink,
  };
}