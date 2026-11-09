import type { Note } from '../../model/types/note';

export const compareNotesNewestFirst = (a: Note, b: Note): number => b.updatedAt - a.updatedAt;

export const compareNotesOldestFirst = (a: Note, b: Note): number => a.updatedAt - b.updatedAt;

export const compareNotesByTitle = (a: Note, b: Note): number =>
  a.title.localeCompare(b.title, 'uk');