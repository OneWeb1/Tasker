import type { Note } from '../../model/types/note';

type NoteComparator = (a: Note, b: Note) => number;

export const isNotePinned = (note: Note): boolean => note.isPinned === true;

export const withPinnedFirst =
  (compare: NoteComparator): NoteComparator =>
  (a, b) =>
    Number(isNotePinned(b)) - Number(isNotePinned(a)) || compare(a, b);