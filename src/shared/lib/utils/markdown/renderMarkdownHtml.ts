import { MARKDOWN_SLOT_KINDS, createFolding, createNumbering } from './model';
import type { MarkdownLine, MarkdownMark, MarkdownSlot, MarkdownSpan } from './model';
import { parseMarkdown } from './parseMarkdown';

const TAGS: Record<MarkdownMark, string> = {
  bold: 'strong',
  italic: 'em',
  underline: 'u',
  strike: 's',
  highlight: 'mark',
  code: 'code',
};

interface RenderMarkdownOptions {
  groupTables?: boolean;
  toggleActions?: boolean;
}

const TOGGLE_ACTION_HTML =
  '<button type="button" data-toggle-action aria-label="Дії з блоком" aria-haspopup="dialog" contenteditable="false"></button>';

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const renderSpan = ({ text, marks, href }: MarkdownSpan): string => {
  const inner = marks.reduceRight(
    (html, mark) => `<${TAGS[mark]}>${html}</${TAGS[mark]}>`,
    escapeHtml(text),
  );
  return href
    ? `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">${inner}</a>`
    : inner;
};

export const ATTACHMENT_SLOT_SELECTOR = '[data-b="attachments"][data-group]';

const escapeAttribute = (text: string): string => escapeHtml(text).replace(/"/g, '&quot;');

export const renderAttachmentsBlockHtml = (
  groupId: string,
  slot?: MarkdownSlot,
  isHidden = false,
): string => {
  const slotAttributes = slot
    ? ` data-slot-kind="${slot.kind}" data-slot-title="${escapeAttribute(slot.title)}"`
    : '';
  const hiddenAttribute = isHidden ? ' data-hidden="true"' : '';
  return `<div data-b="attachments" data-group="${groupId}"${slotAttributes}${hiddenAttribute} contenteditable="false"></div>`;
};

export const readAttachmentSlot = (element: HTMLElement): MarkdownSlot | undefined => {
  const kind = MARKDOWN_SLOT_KINDS.find((item) => item === element.dataset.slotKind);
  return kind ? { kind, title: element.dataset.slotTitle ?? '' } : undefined;
};

const renderTableCells = (
  cells: readonly (readonly MarkdownSpan[])[],
  columns: number,
): string =>
  Array.from({ length: Math.max(columns, 1) }, (_, index) => {
    const content = cells[index]?.map(renderSpan).join('') ?? '';
    return `<span data-cell>${content || '<br>'}</span>`;
  }).join('');

const renderTableGroup = (
  rows: readonly MarkdownLine[],
  level: number,
  isHidden: boolean,
): string => {
  const columns = Math.max(1, ...rows.map(({ cells }) => cells?.length ?? 0));
  const attributes = ['data-b="table-scroll"'];
  if (isHidden) attributes.push('data-hidden="true"');
  if (level > 0) attributes.push(`data-level="${level}"`);
  attributes.push(`style="--cols:${columns}"`);
  const body = rows
    .map(({ cells }) => `<div data-b="table">${renderTableCells(cells ?? [], columns)}</div>`)
    .join('');
  return `<div ${attributes.join(' ')}>${body}</div>`;
};

const renderLine = (
  line: MarkdownLine,
  position: number,
  isHidden: boolean,
  hasActions: boolean,
): string => {
  if (line.kind === 'attachments') {
    return line.groupId ? renderAttachmentsBlockHtml(line.groupId, line.slot, isHidden) : '';
  }
  if (line.kind === 'hr') {
    return `<div data-b="hr"${isHidden ? ' data-hidden="true"' : ''}${line.level > 0 ? ` data-level="${line.level}"` : ''} contenteditable="false"><br></div>`;
  }
  const attributes = [`data-b="${line.kind}"`];
  if (isHidden) attributes.push('data-hidden="true"');
  if (line.kind === 'toggle' && line.isCollapsed) attributes.push('data-collapsed="true"');
  if (line.level > 0) attributes.push(`data-level="${line.level}"`);
  if (line.align) attributes.push(`data-align="${line.align}"`);
  if (line.kind === 'check' && line.isChecked) attributes.push('data-checked="true"');
  if (position > 0) attributes.push(`data-n="${position}"`);
  if (line.kind === 'table') {
    const cells = line.cells ?? [];
    attributes.push(`data-cols="${Math.max(cells.length, 1)}"`);
    return `<div ${attributes.join(' ')}>${renderTableCells(cells, cells.length)}</div>`;
  }
  const inner = line.spans.map(renderSpan).join('');
  const action = hasActions && line.kind === 'toggle' ? TOGGLE_ACTION_HTML : '';
  return `<div ${attributes.join(' ')}>${inner || '<br>'}${action}</div>`;
};

export const renderMarkdownHtml = (
  source: string,
  { groupTables = false, toggleActions = false }: RenderMarkdownOptions = {},
): string => {
  const numberOf = createNumbering();
  const foldingOf = createFolding();
  const html: string[] = [];
  let group: MarkdownLine[] = [];
  let groupLevel = 0;
  let isGroupHidden = false;

  const flushGroup = () => {
    if (group.length === 0) return;
    html.push(renderTableGroup(group, groupLevel, isGroupHidden));
    group = [];
  };

  for (const line of parseMarkdown(source)) {
    const isRow = groupTables && line.kind === 'table';
    if (isRow && group.length > 0 && groupLevel === line.level) {
      group.push(line);
      continue;
    }

    flushGroup();
    const position = numberOf(line.kind, line.kind === 'code' ? 0 : line.level);
    const isBlank = line.kind === 'p' && line.spans.length === 0;
    const isHidden = foldingOf(line.kind, line.level, line.isCollapsed === true, isBlank);

    if (isRow) {
      group = [line];
      groupLevel = line.level;
      isGroupHidden = isHidden;
      continue;
    }
    html.push(renderLine(line, position, isHidden, toggleActions));

  }

  flushGroup();
  return html.join('');
};