import { replaceNoteSection } from '@/entities/note';
import type { NoteSection } from '@/entities/note';
import { normalizeNoteContent } from '../normalizeNoteContent';
import { collapseToggleBlocks } from '../noteToggleBlocks';

const HEAD_PATTERN = /^\s*(<!--(?:center|right)-->)?\[([+-])\] (.*)$/;

export interface NoteSectionParts {
  directive: string;
  title: string;
  content: string;
  isCollapsed: boolean;
}

export interface NoteSectionUpdate {
  title: string;
  content: string;
  isCollapsed?: boolean;
}

export const splitNoteSection = ({ text }: NoteSection): NoteSectionParts => {
  const [first = '', ...rest] = text.split('\n');
  const head = HEAD_PATTERN.exec(first);
  const lines = collapseToggleBlocks(
    [head ? `[${head[2]}] ${head[3]}` : first, ...rest].join('\n'),
  ).split('\n');

  return {
    directive: head?.[1] ?? '',
    isCollapsed: head?.[2] === '-',
    title: (head?.[3] ?? '').trim(),
    content: lines.slice(1, -1).join('\n'),
  };
};

export const applyNoteSectionUpdate = (
  content: string,
  section: NoteSection,
  update: NoteSectionUpdate,
): string => {
  const { directive, isCollapsed } = splitNoteSection(section);
  const marker = (update.isCollapsed ?? isCollapsed) ? '-' : '+';
  const block = [
    `[${marker}] ${update.title}`,
    ...(update.content === '' ? [] : [update.content]),
    '[/]',
  ].join('\n');

  return replaceNoteSection(content, section, directive + normalizeNoteContent(block));
};