import {
  MARKDOWN_BLOCK_KINDS,
  clampLevel,
  createNumbering,
  orderMarks,
  readAttachmentSlot,
  sanitizeHref,
  renderAttachmentsBlockHtml,
  renderMarkdownHtml,
  serializeMarkdown,
  syncBlockFolding,
} from '@/shared/lib/utils/markdown';
import type {
  MarkdownAlign,
  MarkdownBlockKind,
  MarkdownLine,
  MarkdownMark,
  MarkdownSpan,
} from '@/shared/lib/utils/markdown';
import { pruneCaretAnchors, stripCaretAnchor } from '../noteAnchor';

const MARK_BY_TAG: Partial<Record<string, MarkdownMark>> = {
  B: 'bold',
  STRONG: 'bold',
  I: 'italic',
  EM: 'italic',
  U: 'underline',
  S: 'strike',
  STRIKE: 'strike',
  DEL: 'strike',
  CODE: 'code',
  MARK: 'highlight',
};

const isBlockKind = (value: string | undefined): value is MarkdownBlockKind =>
  MARKDOWN_BLOCK_KINDS.some((kind) => kind === value);

export const getNoteBlocks = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.children).filter((child): child is HTMLElement => child instanceof HTMLElement);

export const getBlockKind = (block: HTMLElement): MarkdownBlockKind => {
  const kind = block.dataset.b;
  return isBlockKind(kind) ? kind : 'p';
};

export const getBlockLevel = (block: HTMLElement): number => clampLevel(Number(block.dataset.level));

export const isAttachmentsBlock = (block: HTMLElement): boolean => block.dataset.b === 'attachments';

export const getBlockAlign = (block: HTMLElement): MarkdownAlign | undefined => {
  const align = block.dataset.align;
  return align === 'center' || align === 'right' ? align : undefined;
};

export const setBlockAlign = (block: HTMLElement, align: MarkdownAlign | undefined): void => {
  if (align) block.dataset.align = align;
  else delete block.dataset.align;
};

export const setBlockKind = (block: HTMLElement, kind: MarkdownBlockKind): void => {
  block.dataset.b = kind;
  if (kind !== 'check') delete block.dataset.checked;
  if (kind !== 'number') delete block.dataset.n;
  if (kind !== 'toggle') delete block.dataset.collapsed;
};

export const setBlockLevel = (block: HTMLElement, level: number): void => {
  const next = clampLevel(level);
  if (next > 0) block.dataset.level = String(next);
  else delete block.dataset.level;
};

export const ensureBlockPlaceholder = (block: HTMLElement): void => {
  if (isAttachmentsBlock(block)) return;
  if ((block.textContent ?? '') === '' && block.querySelector('br') === null) {
    block.append(document.createElement('br'));
  }
};

export const createNoteBlock = (
  kind: MarkdownBlockKind = 'p',
  level = 0,
  align?: MarkdownAlign,
): HTMLDivElement => {
  const block = document.createElement('div');
  setBlockKind(block, kind);
  setBlockLevel(block, level);
  setBlockAlign(block, align);
  block.append(document.createElement('br'));
  return block;
};

export const createAttachmentsBlock = (groupId: string): HTMLDivElement => {
  const block = document.createElement('div');
  setBlockKind(block, 'attachments');
  block.dataset.group = groupId;
  block.contentEditable = 'false';
  return block;
};

const isTableCell = (node: Node): node is HTMLElement =>
  node instanceof HTMLElement && node.dataset.cell !== undefined;

export const getTableCells = (block: HTMLElement): HTMLElement[] =>
  Array.from(block.children).filter(isTableCell);

const createTableCell = (): HTMLSpanElement => {
  const cell = document.createElement('span');
  cell.dataset.cell = '';
  cell.append(document.createElement('br'));
  return cell;
};

export const createTableRow = (columns: number, level = 0): HTMLDivElement => {
  const block = document.createElement('div');
  setBlockKind(block, 'table');
  setBlockLevel(block, level);
  block.dataset.cols = String(columns);
  for (let index = 0; index < columns; index += 1) block.append(createTableCell());
  return block;
};

const normalizeTableRow = (block: HTMLElement): void => {
  let last: HTMLElement | null = null;

  for (const node of Array.from(block.childNodes)) {
    if (isTableCell(node)) {
      last = node;
      continue;
    }
    const isBlank =
      node instanceof HTMLBRElement ||
      (node.nodeType === Node.TEXT_NODE && (node.textContent ?? '') === '');
    if (isBlank) {
      node.remove();
      continue;
    }
    if (!last) {
      last = createTableCell();
      last.replaceChildren();
      node.before(last);
    }
    last.append(node);
  }

  const cells = getTableCells(block);
  const columns = Math.max(Number(block.dataset.cols) || 0, cells.length, 1);
  for (let index = cells.length; index < columns; index += 1) block.append(createTableCell());
  block.dataset.cols = String(columns);
  getTableCells(block).forEach((cell) => ensureBlockPlaceholder(cell));
};

const padAttachmentBlocks = (root: HTMLElement): void => {
  for (const block of getNoteBlocks(root)) {
    if (!isAttachmentsBlock(block)) continue;
    const next = block.nextElementSibling;

    if (!block.previousElementSibling) block.before(createNoteBlock());
    if (!(next instanceof HTMLElement) || isAttachmentsBlock(next)) block.after(createNoteBlock());

  }
};

const syncNoteNumbering = (root: HTMLElement): void => {
  const numberOf = createNumbering();

  for (const block of getNoteBlocks(root)) {
    const kind = getBlockKind(block);
    const position = numberOf(kind, kind === 'code' ? 0 : getBlockLevel(block));
    if (position > 0) {
      if (block.dataset.n !== String(position)) block.dataset.n = String(position);
    } else if (block.dataset.n !== undefined) {
      delete block.dataset.n;
    }
  }
};

export const normalizeNoteRoot = (root: HTMLElement): HTMLElement | null => {
  let adopted: HTMLElement | null = null;
  let wrapper: HTMLElement | null = null;

  pruneCaretAnchors(root);

  for (const node of Array.from(root.childNodes)) {
    if (node instanceof HTMLDivElement) {
      wrapper = null;
      if (getBlockKind(node) === 'table') normalizeTableRow(node);
      ensureBlockPlaceholder(node);
      continue;
    }
    if (
      node instanceof HTMLBRElement ||
      node.nodeType === Node.COMMENT_NODE ||
      (node.nodeType === Node.TEXT_NODE && (node.textContent ?? '') === '')
    ) {
      node.remove();
      continue;
    }
    if (!wrapper) {
      wrapper = createNoteBlock();
      wrapper.replaceChildren();
      (node as ChildNode).before(wrapper);
      adopted = wrapper;
    }
    wrapper.append(node);
  }

  if (root.children.length === 0) {
    adopted = createNoteBlock();
    root.append(adopted);
  }

  padAttachmentBlocks(root);
  syncNoteNumbering(root);
  syncBlockFolding(root);
  return adopted;
};

export const writeNoteDocument = (root: HTMLElement, markdown: string): void => {
  root.innerHTML = renderMarkdownHtml(markdown);
  normalizeNoteRoot(root);
};

const resolveMarks = (
  element: HTMLElement,
  inherited: ReadonlySet<MarkdownMark>,
): Set<MarkdownMark> => {
  const marks = new Set(inherited);
  const tagMark = MARK_BY_TAG[element.tagName];
  if (tagMark) marks.add(tagMark);

  const { fontWeight, fontStyle } = element.style;
  const decoration = element.style.textDecorationLine || element.style.textDecoration;

  if (fontWeight !== '') {
    if (fontWeight === 'bold' || Number(fontWeight) >= 600) marks.add('bold');
    else marks.delete('bold');
  }
  if (fontStyle !== '') {
    if (fontStyle === 'italic') marks.add('italic');
    else marks.delete('italic');
  }
  if (decoration.includes('underline')) marks.add('underline');
  if (decoration.includes('line-through')) marks.add('strike');

  return marks;
};

const collectSpans = (
  node: Node,
  marks: ReadonlySet<MarkdownMark>,
  spans: MarkdownSpan[],
  href?: string,
): void => {
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = stripCaretAnchor((child.textContent ?? '').replace(/\u00a0/g, ' '));
      if (text !== '') spans.push({ text, marks: orderMarks(marks), ...(href ? { href } : {}) });
      return;
    }
    if (!(child instanceof HTMLElement) || child.tagName === 'BR') return;
    const childHref =
      child.tagName === 'A'
        ? (sanitizeHref(child.getAttribute('href') ?? '') ?? href)
        : href;
    collectSpans(child, resolveMarks(child, marks), spans, childHref ?? undefined);
  });
};

const readNoteLines = (root: HTMLElement): MarkdownLine[] =>
  getNoteBlocks(root).map((block): MarkdownLine => {
    const kind = getBlockKind(block);
    if (kind === 'attachments') {
      const slot = readAttachmentSlot(block);
      return {
        kind,
        level: 0,
        isChecked: false,
        spans: [],
        groupId: block.dataset.group,
        ...(slot ? { slot } : {}),
      };
    }
    if (kind === 'table') {
      return {
        kind,
        level: getBlockLevel(block),
        isChecked: false,
        spans: [],
        cells: getTableCells(block).map((cell) => {
          const cellSpans: MarkdownSpan[] = [];
          collectSpans(cell, new Set(), cellSpans);
          return cellSpans;
        }),
      };
    }
    const spans: MarkdownSpan[] = [];
    const align = getBlockAlign(block);
    collectSpans(block, new Set(), spans);

    return {
      kind,
      level: getBlockLevel(block),
      isChecked: block.dataset.checked === 'true',
      spans: kind === 'code' ? spans.map(({ text }) => ({ text, marks: [] })) : spans,
      ...(align ? { align } : {}),
      ...(kind === 'toggle' && block.dataset.collapsed === 'true' ? { isCollapsed: true } : {}),
    };
  });

export const readNoteMarkdown = (root: HTMLElement): string =>
  serializeMarkdown(readNoteLines(root));

export const readNoteHtml = (root: HTMLElement): string =>
  getNoteBlocks(root)
    .map((block) =>
      isAttachmentsBlock(block)
        ? renderAttachmentsBlockHtml(block.dataset.group ?? '', readAttachmentSlot(block))
        : block.outerHTML,
    )
    .join('');