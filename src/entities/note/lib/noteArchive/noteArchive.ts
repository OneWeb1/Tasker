import type { Note } from '../../model/types/note';

export const isNoteArchived = (note: Note): boolean => note.isArchived === true;