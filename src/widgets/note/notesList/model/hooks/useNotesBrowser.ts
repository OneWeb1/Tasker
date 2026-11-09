import { useMemo } from 'react';
import {
  collectNoteTags,
  compareNotesByTitle,
  compareNotesNewestFirst,
  hasNoteTag,
  isNoteArchived,
  isSameNoteTag,
  withPinnedFirst,
} from '@/entities/note';
import type { Note } from '@/entities/note';
import { NOTES_VIEW_OPTIONS, useNotesTag, useNotesView } from '@/features/note/browseNotes';
import type { NotesView } from '@/features/note/browseNotes';
import { useOpenedNote } from './useOpenedNote';
import { useScopedNotes } from './useScopedNotes';

interface ViewRule {
  isIncluded: (note: Note) => boolean;
  compare: (a: Note, b: Note) => number;
  emptyText: string;
}

const isActiveNote = (note: Note): boolean => !isNoteArchived(note);

const VIEW_RULES: Record<NotesView, ViewRule> = {
  recents: {
    isIncluded: isActiveNote,
    compare: withPinnedFirst(compareNotesNewestFirst),
    emptyText: 'Нотаток поки немає',
  },
  alphabetical: {
    isIncluded: isActiveNote,
    compare: withPinnedFirst(compareNotesByTitle),
    emptyText: 'Нотаток поки немає',
  },
  archived: {
    isIncluded: isNoteArchived,
    compare: compareNotesNewestFirst,
    emptyText: 'Архів порожній',
  },
};

export function useNotesBrowser() {
  const scopedNotes = useScopedNotes();
  const { view } = useNotesView();
  const { tag, setTag } = useNotesTag();
  const { openedNote, isNoteOpen, openNote, closeNote } = useOpenedNote(scopedNotes);

  const rule = VIEW_RULES[view];

  const viewNotes = useMemo(() => scopedNotes.filter(rule.isIncluded), [scopedNotes, rule]);

  const tags = useMemo(() => collectNoteTags(viewNotes), [viewNotes]);

  const activeTag = useMemo(
    () => (tag === null ? null : (tags.find((item) => isSameNoteTag(item, tag)) ?? null)),
    [tag, tags],
  );

  const visibleNotes = useMemo(() => {
    const filtered =
      activeTag === null ? viewNotes : viewNotes.filter((note) => hasNoteTag(note, activeTag));
    return [...filtered].sort(rule.compare);
  }, [activeTag, rule, viewNotes]);

  return {
    notes: visibleNotes,
    tags,
    activeTag,
    selectTag: setTag,
    heading: NOTES_VIEW_OPTIONS.find((option) => option.value === view)?.label ?? '',
    emptyText: rule.emptyText,
    openedNote,
    isNoteOpen,
    openNote,
    closeNote,
  };
}