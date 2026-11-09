import type { NoteFragment } from '../../model/types/note';

const SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

const escapePattern = (value: string): string => value.replace(SPECIAL_CHARS, '\\$&');

const buildFragmentPattern = (text: string): RegExp | null => {
  const tokens = text.split(/\s+/).filter((token) => token !== '');
  if (tokens.length === 0) return null;
  return new RegExp(tokens.map(escapePattern).join('\\s+'), 'g');
};

export const replaceNoteFragment = (
  content: string,
  { text, occurrence }: NoteFragment,
  replacement: string,
): string | null => {
  const pattern = buildFragmentPattern(text);
  if (!pattern) return null;

  const count = content.match(pattern)?.length ?? 0;
  const target = count === 1 ? 0 : occurrence;
  if (count === 0 || target >= count) return null;

  let index = -1;
  return content.replace(pattern, (match) => {
    index += 1;
    return index === target ? replacement : match;
  });
};