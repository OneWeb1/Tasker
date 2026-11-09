import { useMemo } from 'react';
import {
  compareNotesByTitle,
  compareNotesNewestFirst,
  compareNotesOldestFirst,
  getNoteSearchFields,
  isNoteArchived,
  withPinnedFirst,
} from '@/entities/note';
import type { Note } from '@/entities/note';
import { matchesQuery, useDaySearch } from '@/features/day/searchDay';
import { useSelectedDate } from '@/features/day/selectDate';
import { NOTE_SORT_OPTIONS, useNoteSort } from '@/features/note/sortNotes';
import type { NoteSortOrder } from '@/features/note/sortNotes';
import { toDateKey } from '@/shared/lib/utils/date';
import { useOpenedNote } from './useOpenedNote';
import { useScopedNotes } from './useScopedNotes';

const COMPARATORS: Record<NoteSortOrder, (a: Note, b: Note) => number> = {
  newest: compareNotesNewestFirst,
  oldest: compareNotesOldestFirst,
  title: compareNotesByTitle,
};

export function useNotesList() {
  const notes = useScopedNotes();
  const { order } = useNoteSort();
  const { query } = useDaySearch();
  const { selectedDate } = useSelectedDate();
  const { openedNote, isNoteOpen, openNote, closeNote } = useOpenedNote(notes);

  const sortedNotes = useMemo(
    () =>
      notes
        .filter(
          (note) =>
            !isNoteArchived(note) &&
            toDateKey(new Date(note.updatedAt)) === selectedDate &&
            matchesQuery(query, ...getNoteSearchFields(note)),
        )
        .sort(withPinnedFirst(COMPARATORS[order])),
    [notes, order, query, selectedDate],
  );

  const sectionLabel = NOTE_SORT_OPTIONS.find((option) => option.value === order)?.label ?? '';

  return { notes: sortedNotes, sectionLabel, openedNote, isNoteOpen, openNote, closeNote };
}