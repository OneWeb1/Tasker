import { stripMarkdownDirectives } from '@/shared/lib/utils/markdown';
import type { Note } from '../../model/types/note';

export const getNoteSearchFields = (note: Note): string[] => [
  note.title,
  stripMarkdownDirectives(note.content),
  ...(note.tags ?? []),
  ...(note.attachments ?? []).flatMap(({ name, groupTitle }) =>
    groupTitle ? [name, groupTitle] : [name],
  ),
];