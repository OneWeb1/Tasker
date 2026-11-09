import {
  DEFAULT_NOTE_TAG,
  NOTE_TAG_MAX_LENGTH,
  NOTE_TAGS_MAX_COUNT,
} from '../../model/constants/noteTags';
import type { Note } from '../../model/types/note';

const toTagKey = (tag: string): string => tag.toLocaleLowerCase('uk');

const normalizeNoteTag = (raw: string): string =>
  raw.replace(/^#+/, '').replace(/\s+/g, ' ').trim().slice(0, NOTE_TAG_MAX_LENGTH);

const getNoteTags = (note: Pick<Note, 'tags'>): string[] =>
  note.tags && note.tags.length > 0 ? note.tags : [DEFAULT_NOTE_TAG];

export const isSameNoteTag = (a: string, b: string): boolean => toTagKey(a) === toTagKey(b);

export const addNoteTag = (tags: readonly string[], raw: string): string[] => {
  const tag = normalizeNoteTag(raw);
  const isRejected =
    tag === '' ||
    tags.length >= NOTE_TAGS_MAX_COUNT ||
    tags.some((existing) => isSameNoteTag(existing, tag));

  return isRejected ? [...tags] : [...tags, tag];
};

export const removeNoteTag = (tags: readonly string[], tag: string): string[] =>
  tags.filter((existing) => !isSameNoteTag(existing, tag));

export const hasNoteTag = (note: Pick<Note, 'tags'>, tag: string): boolean =>
  getNoteTags(note).some((existing) => isSameNoteTag(existing, tag));

export const collectNoteTags = (notes: readonly Pick<Note, 'tags'>[]): string[] => {
  const unique = new Map<string, string>();

  for (const note of notes) {
    for (const tag of getNoteTags(note)) {
      const key = toTagKey(tag);
      if (!unique.has(key)) unique.set(key, tag);
    }
  }

  return [...unique.values()].sort((a, b) => a.localeCompare(b, 'uk'));
};