import { formatAlignDirective, formatAttachmentsLine } from './markdownDirectives';
import { formatTableRow, formatTableSeparator } from './markdownTable';
import { createNumbering } from './model';
import type { MarkdownBlockKind, MarkdownLine, MarkdownMark, MarkdownSpan } from './model';

const FENCE = '```';
const INDENT = '  ';

type WrapMark = Exclude<MarkdownMark, 'code'>;

const WRAPPERS: Record<WrapMark, readonly [string, string]> = {
  bold: ['**', '**'],
  italic: ['_', '_'],
  underline: ['<u>', '</u>'],
  strike: ['~~', '~~'],
  highlight: ['==', '=='],
};

const openMarks = (marks: readonly WrapMark[]): string =>
  marks.map((mark) => WRAPPERS[mark][0]).join('');

const closeMarks = (marks: readonly WrapMark[]): string =>
  [...marks]
    .reverse()
    .map((mark) => WRAPPERS[mark][1])
    .join('');

const serializeSpans = (spans: readonly MarkdownSpan[]): string => {
  const stack: WrapMark[] = [];
  let result = '';

  for (const span of spans) {
    if (span.text === '') continue;

    const wanted = span.marks.filter((mark): mark is WrapMark => mark !== 'code');
    const mismatch = stack.findIndex((mark) => !wanted.includes(mark));

    if (mismatch !== -1) {
      const closing = stack.splice(mismatch);
      const reopened = closing.filter((mark) => wanted.includes(mark));
      result += closeMarks(closing) + openMarks(reopened);
      stack.push(...reopened);
    }

    const opened = wanted.filter((mark) => !stack.includes(mark));
    result += openMarks(opened);
    stack.push(...opened);

    const body = span.marks.includes('code') ? `\`${span.text}\`` : span.text;
    result += span.href ? `[${body}](${span.href.replace(/[)\s]/g, encodeURIComponent)})` : body;
  }

  return result + closeMarks(stack);
};

const prefixOf = (line: MarkdownLine, position: number): string => {
  switch (line.kind) {
    case 'h1':
      return '# ';
    case 'h2':
      return '## ';
    case 'h3':
      return '### ';
    case 'h4':
      return '#### ';
    case 'bullet':
      return '- ';
    case 'number':
      return `${position}. `;
    case 'check':
      return line.isChecked ? '- [x] ' : '- [ ] ';
    case 'quote':
      return '> ';
    case 'callout':
      return '> [!info] ';
    case 'toggle':
      return line.isCollapsed ? '[-] ' : '[+] ';
    case 'hr':
      return '---';
    default:
      return '';
  }
};

export const serializeMarkdown = (lines: readonly MarkdownLine[]): string => {
  const output: string[] = [];
  const numberOf = createNumbering();
  let isFenced = false;
  let fenceLevel = 0;
  let previousKind: MarkdownBlockKind | null = null;

  for (const line of lines) {
    const previous = previousKind;
    previousKind = line.kind;
    const isCode = line.kind === 'code';
    if (isFenced && (!isCode || line.level !== fenceLevel)) {
      output.push(INDENT.repeat(fenceLevel) + FENCE);
      isFenced = false;
    }
    if (isCode && !isFenced) {
      fenceLevel = line.level;
      output.push(INDENT.repeat(fenceLevel) + FENCE);
      isFenced = true;
    }

    const position = numberOf(line.kind, isCode ? 0 : line.level);

    if (isCode) {
      output.push(INDENT.repeat(line.level) + line.spans.map(({ text }) => text).join(''));
      continue;
    }

    if (line.kind === 'table') {
      const cells = (line.cells ?? []).map(serializeSpans);
      const indent = INDENT.repeat(line.level);
      output.push(indent + formatTableRow(cells));
      if (previous !== 'table') output.push(indent + formatTableSeparator(cells.length));
      continue;
    }

    if (line.kind === 'attachments') {
      if (line.groupId) output.push(formatAttachmentsLine(line.groupId, line.slot));
      continue;
    }

    output.push(
      INDENT.repeat(line.level) +
        formatAlignDirective(line.align) +
        prefixOf(line, position) +
        serializeSpans(line.spans),
    );
  }

  if (isFenced) output.push(INDENT.repeat(fenceLevel) + FENCE);
  return output.join('\n');
};