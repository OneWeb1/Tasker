import { matchAttachmentsLine, splitAlignDirective } from './markdownDirectives';
import { matchMarkdownLink } from './markdownLinks';
import { isTableSeparator, matchTableRow } from './markdownTable';
import { MAX_MARKDOWN_LEVEL, orderMarks } from './model';
import type { MarkdownBlockKind, MarkdownLine, MarkdownMark, MarkdownSpan } from './model';

const FENCE = '```';
const INDENT_WIDTH = 2;

interface LinePattern {
  kind: MarkdownBlockKind;
  pattern: RegExp;
}

interface InlineMarker {
  mark: MarkdownMark;
  open: string;
  close: string;
}

const LINE_PATTERNS: readonly LinePattern[] = [
  { kind: 'hr', pattern: /^(?:-{3,}|\*{3,}|_{3,})\s*$/ },
  { kind: 'h4', pattern: /^#### / },
  { kind: 'h3', pattern: /^### / },
  { kind: 'h2', pattern: /^## / },
  { kind: 'h1', pattern: /^# / },
  { kind: 'toggle', pattern: /^\[[+-]\] / },
  { kind: 'check', pattern: /^- \[[ xX]\] / },
  { kind: 'bullet', pattern: /^- / },
  { kind: 'number', pattern: /^\d+\. / },
  { kind: 'callout', pattern: /^> \[!info\] / },
  { kind: 'quote', pattern: /^> / },
];

const INLINE_MARKERS: readonly InlineMarker[] = [
  { mark: 'bold', open: '**', close: '**' },
  { mark: 'strike', open: '~~', close: '~~' },
  { mark: 'underline', open: '<u>', close: '</u>' },
  { mark: 'italic', open: '_', close: '_' },
  { mark: 'highlight', open: '==', close: '==' },
];

const isWordChar = (char: string | undefined): boolean =>
  char !== undefined && /[\p{L}\p{N}]/u.test(char);

const hasSameMarks = (a: readonly MarkdownMark[], b: readonly MarkdownMark[]): boolean =>
  a.length === b.length && a.every((mark, index) => mark === b[index]);

const isValidClose = (marker: InlineMarker, text: string, position: number): boolean => {
  if (marker.mark === 'italic') return !isWordChar(text[position + marker.close.length]);
  if (marker.mark === 'highlight') return !/\s/.test(text[position - 1] ?? ' ');
  return true;
};

const findClose = (marker: InlineMarker, text: string, from: number): number => {
  let position = text.indexOf(marker.close, from);
  while (position !== -1 && !isValidClose(marker, text, position)) {
    position = text.indexOf(marker.close, position + marker.close.length);
  }
  return position;
};

const canOpen = (marker: InlineMarker, text: string, index: number): boolean => {
  if (!text.startsWith(marker.open, index)) return false;
  if (marker.mark === 'italic' && isWordChar(text[index - 1])) return false;
  if (marker.mark === 'highlight' && /\s/.test(text[index + marker.open.length] ?? ' ')) {
    return false;
  }
  const from = index + marker.open.length;
  return findClose(marker, text, from) > from;
};

const canClose = (marker: InlineMarker, text: string, index: number): boolean =>
  text.startsWith(marker.close, index) && isValidClose(marker, text, index);

const parseInline = (text: string): MarkdownSpan[] => {
  const spans: MarkdownSpan[] = [];
  const active = new Set<MarkdownMark>();
  let buffer = '';

  const push = (value: string, marks: readonly MarkdownMark[], href?: string) => {
    const last = spans[spans.length - 1];
    if (last && hasSameMarks(last.marks, marks) && last.href === href) {
      spans[spans.length - 1] = { ...last, text: last.text + value };
    } else {
      spans.push({ text: value, marks, ...(href ? { href } : {}) });
    }
  };

  const flush = () => {
    if (buffer === '') return;
    push(buffer, orderMarks(active));
    buffer = '';
  };

  let index = 0;
  while (index < text.length) {
    if (text[index] === '[') {
      const link = matchMarkdownLink(text, index);
      if (link) {
        flush();
        push(link.label, orderMarks(active), link.href);
        index += link.length;
        continue;
      }
    }

    if (text[index] === '`') {
      const end = text.indexOf('`', index + 1);
      if (end > index + 1) {
        flush();
        push(text.slice(index + 1, end), orderMarks([...active, 'code']));
        index = end + 1;
        continue;
      }
    }

    let consumed = 0;
    for (const marker of INLINE_MARKERS) {
      if (active.has(marker.mark)) {
        if (canClose(marker, text, index)) {
          flush();
          active.delete(marker.mark);
          consumed = marker.close.length;
          break;
        }
      } else if (canOpen(marker, text, index)) {
        flush();
        active.add(marker.mark);
        consumed = marker.open.length;
        break;
      }
    }

    if (consumed > 0) {
      index += consumed;
      continue;
    }
    buffer += text[index];
    index += 1;
  }

  flush();
  return spans;
};

const measureIndent = (raw: string): { expanded: string; spaces: number; level: number } => {
  const expanded = raw.replace(/^\t+/, (tabs) => ' '.repeat(tabs.length * INDENT_WIDTH));
  const spaces = expanded.length - expanded.trimStart().length;
  const level = Math.min(Math.floor(spaces / INDENT_WIDTH), MAX_MARKDOWN_LEVEL);
  return { expanded, spaces, level };
};

const parseLine = (raw: string): MarkdownLine => {
  const directive = matchAttachmentsLine(raw);
  if (directive !== null) {
    return {
      kind: 'attachments',
      level: 0,
      isChecked: false,
      spans: [],
      groupId: directive.groupId,
      ...(directive.slot ? { slot: directive.slot } : {}),
    };
  }

  const { expanded, spaces, level } = measureIndent(raw);
  const { align, rest } = splitAlignDirective(expanded.slice(spaces));
  const cells = matchTableRow(rest);
  if (cells) {
    return { kind: 'table', level, isChecked: false, spans: [], cells: cells.map(parseInline) };
  }
  const match = LINE_PATTERNS.find(({ pattern }) => pattern.test(rest));
  const kind = match?.kind ?? 'p';
  const content = match ? rest.replace(match.pattern, '') : rest;

  return {
    kind,
    level,
    isChecked: kind === 'check' && /^- \[[xX]\]/.test(rest),
    ...(kind === 'toggle' && /^\[-\]/.test(rest) ? { isCollapsed: true } : {}),
    spans: parseInline(content),
    ...(align ? { align } : {}),
  };
};

export const parseMarkdown = (source: string): MarkdownLine[] => {
  const lines: MarkdownLine[] = [];
  let isFenced = false;
  let fenceLevel = 0;

  for (const raw of source.split(/\r?\n/)) {
    const trimmed = raw.trim();

    if (!isFenced && trimmed.startsWith(FENCE)) {
      isFenced = true;
      fenceLevel = measureIndent(raw).level;
      continue;
    }
    if (isFenced && trimmed === FENCE) {
      isFenced = false;
      continue;
    }

    if (isFenced) {
      const leading = raw.length - raw.trimStart().length;
      const text = raw.slice(Math.min(leading, fenceLevel * INDENT_WIDTH));
      lines.push({
        kind: 'code',
        level: fenceLevel,
        isChecked: false,
        spans: text === '' ? [] : [{ text, marks: [] }],
      });
      continue;
    }

    if (isTableSeparator(trimmed) && lines[lines.length - 1]?.kind === 'table') continue;

    lines.push(parseLine(raw));
  }

  return lines;
};