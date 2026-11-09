import type { MarkdownBlockKind } from '@/shared/lib/utils/markdown';
import type { NoteTextAlign } from '../../types/noteFormat';
import { isBlockBlank as isEmptyBlock } from '../noteAnchor';
import {
  createNoteBlock,
  ensureBlockPlaceholder,
  getBlockAlign,
  getBlockKind,
  getBlockLevel,
  getNoteBlocks,
  isAttachmentsBlock,
  setBlockAlign,
  setBlockKind,
  setBlockLevel,
} from '../noteDocument';
import { getInsertionLevel } from '../noteLevel';
import { captureNoteSelection, getSelectedBlocks, placeCaret } from '../noteSelection';
import { splitTableRow } from '../noteTable';

const CONTINUING_KINDS: ReadonlySet<MarkdownBlockKind> = new Set([
  'bullet',
  'number',
  'check',
  'quote',
  'callout',
  'code',
  'toggle',
]);

const HEADING_KINDS: ReadonlySet<MarkdownBlockKind> = new Set(['h1', 'h2', 'h3', 'h4']);

export const toggleBlockKind = (root: HTMLElement, kind: MarkdownBlockKind): void => {
  const selected = getSelectedBlocks(root).filter((block) => getBlockKind(block) !== 'table');
  const targets = selected.length > 1 ? selected.filter((block) => !isEmptyBlock(block)) : selected;
  if (targets.length === 0) return;

  const isRemoving = targets.every((block) => getBlockKind(block) === kind);
  for (const block of targets) setBlockKind(block, isRemoving ? 'p' : kind);
};

export const shiftBlockLevel = (root: HTMLElement, direction: 1 | -1): void => {
  for (const block of getSelectedBlocks(root)) {
    if (getBlockKind(block) === 'code') continue;
    setBlockLevel(block, getBlockLevel(block) + direction);
  }
};

export const toggleCheckBlock = (block: HTMLElement): void => {
  if (block.dataset.checked === 'true') delete block.dataset.checked;
  else block.dataset.checked = 'true';
};

export const splitNoteBlock = (root: HTMLElement): void => {
  const selection = window.getSelection();
  const saved = captureNoteSelection(root);
  if (!selection || selection.rangeCount === 0 || !saved) return;

  const block = getNoteBlocks(root)[saved.start.block];
  if (!block) return;

  if (isAttachmentsBlock(block)) {
    const spacer = createNoteBlock();
    block.after(spacer);
    placeCaret(root, spacer, 'start');
    return;
  }

  const range = selection.getRangeAt(0);
  if (!block.contains(range.startContainer)) return;

  const kind = getBlockKind(block);
  if (kind === 'table') {
    splitTableRow(root, block);
    return;
  }
  const level = getBlockLevel(block);
  const align = getBlockAlign(block);

  if (isEmptyBlock(block) && CONTINUING_KINDS.has(kind)) {
    setBlockKind(block, 'p');
    return;
  }

  const isSection = kind === 'toggle';
  const nextKind = HEADING_KINDS.has(kind) || isSection ? 'p' : kind;

  if (saved.start.offset === 0 && !isEmptyBlock(block)) {
    block.before(createNoteBlock(nextKind, level, align));
    return;
  }

  const tail = document.createRange();
  tail.setStart(range.startContainer, range.startOffset);
  tail.setEnd(block, block.childNodes.length);

  if (isSection) delete block.dataset.collapsed;
  const next = createNoteBlock(nextKind, isSection ? level + 1 : level, align);
  next.replaceChildren(tail.extractContents());
  ensureBlockPlaceholder(next);
  ensureBlockPlaceholder(block);
  block.after(next);
  placeCaret(root, next, 'start');
  next.scrollIntoView({ block: 'nearest' });
};

export const demoteBlockAtCaret = (root: HTMLElement): boolean => {
  const saved = captureNoteSelection(root);
  if (
    !saved ||
    saved.start.block !== saved.end.block ||
    saved.start.offset !== 0 ||
    saved.end.offset !== 0
  ) {
    return false;
  }

  const block = getNoteBlocks(root)[saved.start.block];
  if (!block || isAttachmentsBlock(block) || getBlockKind(block) === 'table') return false;

  if (getBlockKind(block) !== 'p') {
    setBlockKind(block, 'p');
    return true;
  }
  if (getBlockLevel(block) > 0) {
    setBlockLevel(block, getBlockLevel(block) - 1);
    return true;
  }
  return false;
};

export const insertTextBlocks = (root: HTMLElement, text: string): void => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');
  if (lines.length === 0) return;

  const blocks = getNoteBlocks(root);
  const saved = captureNoteSelection(root);
  const current = blocks[saved ? saved.end.block : blocks.length - 1];
  if (!current) return;

  let anchor = current;
  let remaining = lines;

  if (isEmptyBlock(current)) {
    current.replaceChildren(document.createTextNode(lines[0]));
    remaining = lines.slice(1);
  }

  for (const line of remaining) {
    const block = createNoteBlock();
    block.replaceChildren(document.createTextNode(line));
    anchor.after(block);
    anchor = block;
  }

  placeCaret(root, anchor, 'end');
  anchor.scrollIntoView({ block: 'nearest' });
};

export const insertDividerBlock = (root: HTMLElement): void => {
  const blocks = getNoteBlocks(root);
  const saved = captureNoteSelection(root);
  const current = blocks[saved ? saved.end.block : blocks.length - 1];
  if (!current) return;

  const isReplacing = isEmptyBlock(current);
  const level = getInsertionLevel(current, isReplacing);
  const divider = createNoteBlock('hr', level);
  divider.contentEditable = 'false';
  const next = createNoteBlock('p', level);

  if (isReplacing) current.replaceWith(divider);
  else current.after(divider);
  divider.after(next);

  placeCaret(root, next, 'start');
  next.scrollIntoView({ block: 'nearest' });
};

export const alignSelectedBlocks = (root: HTMLElement, align: NoteTextAlign): void => {
    for (const block of getSelectedBlocks(root)) {
    if (getBlockKind(block) === 'code' || getBlockKind(block) === 'table') continue;
    setBlockAlign(block, align === 'left' ? undefined : align);
  }
};

export const fillBlockAlign = (root: HTMLElement, align: NoteTextAlign): void => {
  if (align === 'left') return;

  for (const block of getNoteBlocks(root)) {
    if (isAttachmentsBlock(block) || ['code', 'table'].includes(getBlockKind(block))) continue;
    if (getBlockAlign(block) === undefined && !isEmptyBlock(block)) setBlockAlign(block, align);
  }
};

export const guardAttachmentBoundary = (
  root: HTMLElement,
  direction: 'backward' | 'forward',
): boolean => {
  const saved = captureNoteSelection(root);
  if (!saved || saved.start.block !== saved.end.block || saved.start.offset !== saved.end.offset) {
    return false;
  }

  const blocks = getNoteBlocks(root);
  const index = saved.start.block;
  const block = blocks[index];
  if (!block || isAttachmentsBlock(block)) return false;

  const step = direction === 'backward' ? -1 : 1;
  const isAtEdge =
    direction === 'backward'
      ? saved.start.offset === 0
      : saved.start.offset === (block.textContent ?? '').length;
  const neighbour = blocks[index + step];
  if (!isAtEdge || !neighbour || !isAttachmentsBlock(neighbour)) return false;

  const other = blocks[index - step];
  if (isEmptyBlock(block) && other && !isAttachmentsBlock(other)) {
    block.remove();
    placeCaret(root, other, direction === 'backward' ? 'start' : 'end');
  }
  return true;
};