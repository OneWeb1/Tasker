import { toDateKey } from '@/shared/lib/utils/date';
import { stripMarkdownDirectives } from '@/shared/lib/utils/markdown';
import type { Note } from '../../model/types/note';

export interface NoteSearchEntry {
  id: string;
  kind: 'note';
  title: string;
  content: string;
  date: string;
  updatedAt: number;
}

export const buildNoteSearchEntries = (notes: readonly Note[]): NoteSearchEntry[] =>
  notes
    .map((note) => ({
      id: note.id,
      kind: 'note' as const,
      title: note.title,
      content: stripMarkdownDirectives(note.content),
      date: toDateKey(new Date(note.updatedAt)),
      updatedAt: note.updatedAt,
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt);