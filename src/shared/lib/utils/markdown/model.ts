export type MarkdownBlockKind =
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'bullet'
  | 'number'
  | 'check'
  | 'quote'
  | 'callout'
  | 'code'
  | 'hr'
  | 'toggle'
  | 'table'
  | 'attachments';

export type MarkdownAlign = 'center' | 'right';

export type MarkdownSlotKind = 'media' | 'file';

export const MARKDOWN_SLOT_KINDS: readonly MarkdownSlotKind[] = ['media', 'file'];

export interface MarkdownSlot {
  kind: MarkdownSlotKind;
  title: string;
}

export type MarkdownMark = 'bold' | 'italic' | 'underline' | 'strike' | 'highlight' | 'code';

export interface MarkdownSpan {
  text: string;
  marks: readonly MarkdownMark[];
  href?: string;
}

export interface MarkdownLine {
  kind: MarkdownBlockKind;
  level: number;
  isChecked: boolean;
  isCollapsed?: boolean;
  spans: readonly MarkdownSpan[];
  cells?: readonly (readonly MarkdownSpan[])[];
  align?: MarkdownAlign;
  groupId?: string;
  slot?: MarkdownSlot;
}

export const MARKDOWN_BLOCK_KINDS: readonly MarkdownBlockKind[] = [
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'bullet',
  'number',
  'check',
  'quote',
  'callout',
  'code',
  'hr',
  'toggle',
  'table',
  'attachments',
];

const MARK_ORDER: readonly MarkdownMark[] = [
  'bold',
  'italic',
  'underline',
  'strike',
  'highlight',
  'code',
];

export const MAX_MARKDOWN_LEVEL = 12;

export const orderMarks = (marks: Iterable<MarkdownMark>): MarkdownMark[] => {
  const present = new Set(marks);
  return MARK_ORDER.filter((mark) => present.has(mark));
};

export const clampLevel = (level: number): number =>
  Math.min(Math.max(Math.trunc(level) || 0, 0), MAX_MARKDOWN_LEVEL);

export const createNumbering = () => {
  const counters: number[] = [];

  return (kind: MarkdownBlockKind, level: number): number => {
    const isNumber = kind === 'number';
    counters.length = Math.min(counters.length, isNumber ? level + 1 : level);
    if (!isNumber) return 0;
    const next = (counters[level] ?? 0) + 1;
    counters[level] = next;
    return next;
  };
};

export const createFolding = () => {
  let limit: number | null = null;

  return (kind: string, level: number, isCollapsed: boolean, isBlank = false): boolean => {
    const isNeutral = kind === 'attachments' || isBlank;
    if (limit !== null && (isNeutral || level > limit)) return true;
    if (isBlank) return false;
    limit = kind === 'toggle' && isCollapsed ? level : null;
    return false;
  };
};