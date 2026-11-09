import type { MarkdownAlign, MarkdownSlot } from './model';

const ATTACHMENTS_PATTERN = /^<!--attachments:([\w-]+)(?:\|(media|file)\|([^|<>\r\n]*))?-->$/;
const SLOT_TITLE_MAX_LENGTH = 60;
const ALIGN_PATTERN = /^<!--(center|right)-->/;
const ALIGN_LINE_PATTERN = /^(\s*)<!--(?:center|right)-->/;

export interface MarkdownAttachmentsDirective {
  groupId: string;
  slot?: MarkdownSlot;
}

const sanitizeSlotTitle = (title: string): string =>
  title.replace(/[|<>\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, SLOT_TITLE_MAX_LENGTH);

export const matchAttachmentsLine = (line: string): MarkdownAttachmentsDirective | null => {
  const match = ATTACHMENTS_PATTERN.exec(line.trim());
  if (!match) return null;

  const [, groupId, kind, title] = match;
  if (kind !== 'media' && kind !== 'file') return { groupId };
  return { groupId, slot: { kind, title: title.trim() } };
};

export const formatAttachmentsLine = (groupId: string, slot?: MarkdownSlot): string =>
  slot
    ? `<!--attachments:${groupId}|${slot.kind}|${sanitizeSlotTitle(slot.title)}-->`
    : `<!--attachments:${groupId}-->`;

export const splitAlignDirective = (
  text: string,
): { align: MarkdownAlign | undefined; rest: string } => {
  const match = ALIGN_PATTERN.exec(text);
  if (!match) return { align: undefined, rest: text };
  return { align: match[1] === 'right' ? 'right' : 'center', rest: text.slice(match[0].length) };
};

export const formatAlignDirective = (align: MarkdownAlign | undefined): string =>
  align ? `<!--${align}-->` : '';

export const stripMarkdownDirectives = (source: string): string =>
  source
    .split(/\r?\n/)
    .filter((line) => matchAttachmentsLine(line) === null)
    .map((line) => line.replace(ALIGN_LINE_PATTERN, '$1'))
    .join('\n');