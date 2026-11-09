import { isBlockBlank, stripCaretAnchor } from '../noteAnchor';
import {
  createNoteBlock,
  createTableRow,
  getBlockKind,
  getBlockLevel,
  getNoteBlocks,
  getTableCells,
  isAttachmentsBlock,
} from '../noteDocument';
import { getInsertionLevel } from '../noteLevel';
import { captureNoteSelection, placeCaret } from '../noteSelection';

interface CaretCell {
  block: HTMLElement;
  cells: HTMLElement[];
  index: number;
  range: Range;
}

const isTableBlock = (node: Element | null): node is HTMLElement =>
  node instanceof HTMLElement && getBlockKind(node) === 'table';

const placeCaretInCell = (cell: HTMLElement, edge: 'start' | 'end'): void => {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(cell);
  range.collapse(edge === 'start' || (cell.textContent ?? '') === '');
  selection.removeAllRanges();
  selection.addRange(range);
};

const getCaretCell = (root: HTMLElement): CaretCell | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const origin = range.startContainer;
  if (!root.contains(origin)) return null;

  const element = origin instanceof HTMLElement ? origin : origin.parentElement;
  const block = element?.closest<HTMLElement>('[data-b="table"]');
  if (!block || block.parentElement !== root) return null;

  const cells = getTableCells(block);
  return { block, cells, index: cells.findIndex((cell) => cell.contains(origin)), range };
};

const isAtCellEdge = (cell: HTMLElement, range: Range, edge: 'start' | 'end'): boolean => {
  const span = document.createRange();
  span.selectNodeContents(cell);
  if (edge === 'start') span.setEnd(range.startContainer, range.startOffset);
  else span.setStart(range.endContainer, range.endOffset);
  return stripCaretAnchor(span.toString()) === '';
};

const isRowBlank = (cells: readonly HTMLElement[]): boolean =>
  cells.every((cell) => isBlockBlank(cell));

const removeBlankRow = (root: HTMLElement, block: HTMLElement): void => {
  const previous = block.previousElementSibling;
  const neighbour = [previous, block.nextElementSibling].find(isTableBlock);

  if (!neighbour) {
    const paragraph = createNoteBlock('p', getBlockLevel(block));
    block.replaceWith(paragraph);
    placeCaret(root, paragraph, 'start');
    return;
  }

  const cells = getTableCells(neighbour);
  const goesBack = neighbour === previous;
  block.remove();
  const target = goesBack ? cells[cells.length - 1] : cells[0];
  if (target) placeCaretInCell(target, goesBack ? 'end' : 'start');
};

export const insertTableBlocks = (root: HTMLElement, rows: number, columns: number): void => {
  const blocks = getNoteBlocks(root);
  const saved = captureNoteSelection(root);
  const current = blocks[saved ? saved.end.block : blocks.length - 1];
  if (!current) return;

  const isReplacing = isBlockBlank(current);
  const level = getInsertionLevel(current, isReplacing);
  const table = Array.from({ length: rows }, () => createTableRow(columns, level));
  if (isReplacing) current.replaceWith(...table);
  else current.after(...table);

  const last = table[table.length - 1];
  const next = last.nextElementSibling;
  if (!(next instanceof HTMLElement) || isTableBlock(next) || isAttachmentsBlock(next)) {
    last.after(createNoteBlock('p', level));
  }

  const first = getTableCells(table[0])[0];
  if (first) placeCaretInCell(first, 'start');
  table[0].scrollIntoView({ block: 'nearest' });
};

export const splitTableRow = (root: HTMLElement, block: HTMLElement): void => {
  const cells = getTableCells(block);
  const caret = getCaretCell(root);
  const isLastRow = !isTableBlock(block.nextElementSibling);

  if (isLastRow && isTableBlock(block.previousElementSibling) && isRowBlank(cells)) {
    const paragraph = createNoteBlock('p', getBlockLevel(block));
    block.replaceWith(paragraph);
    placeCaret(root, paragraph, 'start');
    return;
  }

  const row = createTableRow(cells.length, getBlockLevel(block));
  block.after(row);
  const rowCells = getTableCells(row);
  const target = rowCells[Math.max(caret?.index ?? 0, 0)] ?? rowCells[0];
  if (target) placeCaretInCell(target, 'start');
  row.scrollIntoView({ block: 'nearest' });
};

export const moveTableCell = (root: HTMLElement, direction: 1 | -1): boolean => {
  const caret = getCaretCell(root);
  if (!caret) return false;

  const { block, cells } = caret;
  const next = cells[Math.max(caret.index, 0) + direction];
  if (next) {
    placeCaretInCell(next, direction === 1 ? 'start' : 'end');
    return true;
  }

  if (direction === -1) {
    const previous = block.previousElementSibling;
    if (!isTableBlock(previous)) return false;
    const previousCells = getTableCells(previous);
    const target = previousCells[previousCells.length - 1];
    if (!target) return false;
    placeCaretInCell(target, 'end');
    return true;
  }

  const following = block.nextElementSibling;
  const row = isTableBlock(following)
    ? following
    : createTableRow(cells.length, getBlockLevel(block));
  if (row !== following) block.after(row);
  const target = getTableCells(row)[0];
  if (target) placeCaretInCell(target, 'start');
  return true;
};

export const guardTableCell = (root: HTMLElement, direction: 'backward' | 'forward'): boolean => {
  const selection = window.getSelection();
  if (!selection || !selection.isCollapsed) return false;

  const caret = getCaretCell(root);
  if (!caret || caret.index === -1) return false;

  const cell = caret.cells[caret.index];
  if (!isAtCellEdge(cell, caret.range, direction === 'backward' ? 'start' : 'end')) return false;

  if (direction === 'backward' && isRowBlank(caret.cells)) removeBlankRow(root, caret.block);
  return true;
};