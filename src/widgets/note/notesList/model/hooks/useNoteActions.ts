import { useCallback, useEffect, useMemo, useState } from 'react';
import { isNoteArchived, isNotePinned } from '@/entities/note';
import type { DeletedNote, Note } from '@/entities/note';
import { useCreateItem } from '@/features/createItem';
import { useArchiveNote } from '@/features/note/archiveNote';
import { useNoteClipboard } from '@/features/note/clipboardNotes';
import { useDeleteNote } from '@/features/note/deleteNote';
import { useDuplicateNote } from '@/features/note/duplicateNote';
import { useExportNote } from '@/features/note/exportNote';
import { usePinNote } from '@/features/note/pinNote';
import { useItemSelection } from '@/shared/lib/hooks/useItemSelection';
import { useToast } from '@/shared/ui/Toast';

export function useNoteActions(notes: readonly Note[]) {
  const { setArchived } = useArchiveNote();
  const { setPinned } = usePinNote();
  const { exportNote } = useExportNote();
  const { deleteNote, undoDelete } = useDeleteNote();
  const { duplicateNote, undoDuplicate } = useDuplicateNote();
  const { copyNotes, cutNotes } = useNoteClipboard();
  const { showToast } = useToast();
  const { open: openCreateItem } = useCreateItem();
  const { selectedIds, isActive, pick, startMulti, clear } = useItemSelection();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const selectedNotes = useMemo(
    () => notes.filter((note) => selectedIds.has(note.id)),
    [notes, selectedIds],
  );

  useEffect(() => {
    if (isActive && selectedNotes.length === 0) clear();
  }, [clear, isActive, selectedNotes.length]);

  const openMenu = useCallback((note: Note) => {
    setSelectedNote(note);
    setIsMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const edit = useCallback(() => {
    if (selectedNote === null) return;
    setIsMenuOpen(false);
    openCreateItem({ kind: 'note', note: selectedNote });
  }, [openCreateItem, selectedNote]);

  const copy = useCallback(() => {
    if (selectedNote === null) return;
    setIsMenuOpen(false);
    copyNotes([selectedNote]);
    showToast({ message: 'Нотатку скопійовано' });
  }, [copyNotes, selectedNote, showToast]);

  const cut = useCallback(() => {
    if (selectedNote === null) return;
    setIsMenuOpen(false);
    cutNotes([selectedNote]);
    showToast({ message: 'Нотатку вирізано' });
  }, [cutNotes, selectedNote, showToast]);

  const duplicate = useCallback(async () => {
    if (selectedNote === null) return;
    setIsMenuOpen(false);
    const created = await duplicateNote(selectedNote);
    if (created === null) {
      showToast({ message: 'Не вдалося дублювати нотатку' });
      return;
    }
    showToast({
      message: 'Нотатку дубльовано',
      actionLabel: 'Скасувати',
      onAction: () => undoDuplicate(created.id),
    });
  }, [duplicateNote, selectedNote, showToast, undoDuplicate]);

  const select = useCallback(() => {
    if (selectedNote === null) return;
    setIsMenuOpen(false);
    pick(selectedNote.id);
    startMulti();
  }, [pick, selectedNote, startMulti]);

  const remove = useCallback(async () => {
    if (selectedNote === null) return;
    setIsMenuOpen(false);
    const snapshot = await deleteNote(selectedNote.id);
    if (snapshot === null) {
      showToast({ message: 'Не вдалося видалити нотатку' });
      return;
    }
    showToast({
      message: 'Нотатку видалено',
      actionLabel: 'Скасувати',
      onAction: () => undoDelete(snapshot),
    });
  }, [deleteNote, selectedNote, showToast, undoDelete]);

  const exportSelected = useCallback(() => {
    if (selectedNote === null) return;
    setIsMenuOpen(false);
    void exportNote(selectedNote);
  }, [exportNote, selectedNote]);

  const openAi = useCallback(() => {
    setIsMenuOpen(false);
    setIsAiOpen(true);
  }, []);

  const closeAi = useCallback(() => setIsAiOpen(false), []);

  const togglePin = useCallback(() => {
    if (selectedNote === null) return;
    setPinned(selectedNote.id, !isNotePinned(selectedNote));
    setIsMenuOpen(false);
  }, [selectedNote, setPinned]);

  const toggleArchive = useCallback(() => {
    if (selectedNote === null) return;
    setArchived(selectedNote.id, !isNoteArchived(selectedNote));
    setIsMenuOpen(false);
  }, [selectedNote, setArchived]);

  const copySelection = useCallback(() => {
    const targets = selectedNotes;
    clear();
    if (targets.length === 0) return;
    copyNotes(targets);
    showToast({ message: `Скопійовано: ${targets.length}` });
  }, [clear, copyNotes, selectedNotes, showToast]);

  const cutSelection = useCallback(() => {
    const targets = selectedNotes;
    clear();
    if (targets.length === 0) return;
    cutNotes(targets);
    showToast({ message: `Вирізано: ${targets.length}` });
  }, [clear, cutNotes, selectedNotes, showToast]);

  const removeSelection = useCallback(async () => {
    const targets = selectedNotes;
    clear();
    const snapshots: DeletedNote[] = [];
    for (const note of targets) {
      const snapshot = await deleteNote(note.id);
      if (snapshot !== null) snapshots.push(snapshot);
    }
    if (snapshots.length === 0) {
      showToast({ message: 'Не вдалося видалити нотатки' });
      return;
    }
    showToast({
      message: `Видалено: ${snapshots.length}`,
      actionLabel: 'Скасувати',
      onAction: () => {
        [...snapshots].reverse().forEach((snapshot) => undoDelete(snapshot));
      },
    });
  }, [clear, deleteNote, selectedNotes, showToast, undoDelete]);

  return {
    selected: selectedNote,
    isMenuOpen,
    isAiOpen,
    openMenu,
    closeMenu,
    edit,
    copy,
    cut,
    duplicate,
    select,
    remove,
    exportSelected,
    openAi,
    closeAi,
    togglePin,
    toggleArchive,
    selection: {
      isActive,
      count: selectedNotes.length,
      selectedIds,
      toggle: pick,
      cancel: clear,
      copy: copySelection,
      cut: cutSelection,
      remove: removeSelection,
    },
  };
}

export type NoteActionsController = ReturnType<typeof useNoteActions>;