import { useMemo } from 'react';
import { isNoteArchived } from '@/entities/note';
import { toDateKey } from '@/shared/lib/utils/date';
import type { DateRange } from '@/shared/lib/utils/date';
import { useScopedNotes } from './useScopedNotes';

export function useNotesCount(range: DateRange | null): number {
  const notes = useScopedNotes();
  const from = range?.from;
  const to = range?.to;

  return useMemo(() => {
    const list = notes.filter((note) => !isNoteArchived(note));
    if (from === undefined || to === undefined) return list.length;

    return list.filter((note) => {
      const dateKey = toDateKey(new Date(note.updatedAt));
      return dateKey >= from && dateKey <= to;
    }).length;
  }, [from, notes, to]);
}