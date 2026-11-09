import { stripMarkdownDirectives } from '@/shared/lib/utils/markdown';
import type { Note } from '../../model/types/note';

export interface NoteMarkdownFile {
  filename: string;
  content: string;
  mime: string;
}

const FILENAME_MAX_LENGTH = 60;
const FALLBACK_FILENAME = 'note';
const UNTITLED = 'Без назви';

const toFilename = (title: string): string => {
  const safe = title
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, FILENAME_MAX_LENGTH)
    .trim();
  return `${safe || FALLBACK_FILENAME}.md`;
};

export const buildNoteMarkdownFile = (note: Note): NoteMarkdownFile => {
  const title = note.title.trim();
  const tags = note.tags ?? [];
  const attachments = note.attachments ?? [];
  const body = stripMarkdownDirectives(note.content).trim();

  const sections = [`# ${title || UNTITLED}`];
  if (tags.length > 0) sections.push(tags.map((tag) => `#${tag.replace(/\s+/g, '_')}`).join(' '));
  if (body !== '') sections.push(body);
  if (attachments.length > 0) {
    sections.push(
      [
        '## Вкладення',
        ...attachments.map(({ name, caption }) => (caption ? `- ${name} — ${caption}` : `- ${name}`)),
      ].join('\n'),
    );
  }

  return {
    filename: toFilename(title),
    content: `${sections.join('\n\n')}\n`,
    mime: 'text/markdown',
  };
};