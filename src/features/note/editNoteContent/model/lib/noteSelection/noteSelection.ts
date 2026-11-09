import { getNoteBlocks, isAttachmentsBlock } from '../noteDocument';

export interface NotePoint {
  block: number;
  offset: number;
}

export interface NoteSelection {
  start: NotePoint;
  end: NotePoint;
}

const textLength = (block: HTMLElement): number =>
  isAttachmentsBlock(block) ? 0 : (block.textContent ?? '').length;

const offsetInBlock = (block: HTMLElement, node: Node, offset: number): number => {
  const range = document.createRange();
  range.selectNodeContents(block);
  range.setEnd(node, offset);
  return range.toString().length;
};

const toPoint = (
  root: HTMLElement,
  blocks: readonly HTMLElement[],
  node: Node,
  offset: number,
): NotePoint | null => {
  if (blocks.length === 0) return null;

  if (node === root) {
    if (offset >= blocks.length) {
      const last = blocks.length - 1;
      return { block: last, offset: textLength(blocks[last]) };
    }
    return { block: offset, offset: 0 };
  }

  const index = blocks.findIndex((block) => block.contains(node));
  if (index === -1) return null;
  if (isAttachmentsBlock(blocks[index])) return { block: index, offset: 0 };
  return { block: index, offset: offsetInBlock(blocks[index], node, offset) };
};

const toBoundary = (blocks: readonly HTMLElement[], point: NotePoint): [Node, number] => {
  const block = blocks[Math.min(point.block, blocks.length - 1)];
  const parent = block.parentNode;
  if (isAttachmentsBlock(block) && parent) {
    return [parent, Array.from(parent.childNodes).indexOf(block)];
  }

  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  let remaining = point.offset;
  let last: Node | null = null;

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const length = node.textContent?.length ?? 0;
    if (remaining <= length) return [node, remaining];
    remaining -= length;
    last = node;
  }

  return last ? [last, last.textContent?.length ?? 0] : [block, 0];
};

export const captureNoteSelection = (root: HTMLElement): NoteSelection | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;

  const blocks = getNoteBlocks(root);
  const start = toPoint(root, blocks, range.startContainer, range.startOffset);
  const end = toPoint(root, blocks, range.endContainer, range.endOffset);
  return start && end ? { start, end } : null;
};

export const restoreNoteSelection = (root: HTMLElement, saved: NoteSelection): void => {
  const blocks = getNoteBlocks(root);
  const selection = window.getSelection();
  if (blocks.length === 0 || !selection) return;

  const [startNode, startOffset] = toBoundary(blocks, saved.start);
  const [endNode, endOffset] = toBoundary(blocks, saved.end);
  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  selection.removeAllRanges();
  selection.addRange(range);
};

export const placeCaret = (
  root: HTMLElement,
  target: HTMLElement | null,
  edge: 'start' | 'end',
): void => {
  const blocks = getNoteBlocks(root);
  const index = target ? blocks.indexOf(target) : blocks.length - 1;
  if (index === -1) return;

  const point = { block: index, offset: edge === 'end' ? textLength(blocks[index]) : 0 };
  restoreNoteSelection(root, { start: point, end: point });
};

export const getSelectedBlocks = (root: HTMLElement): HTMLElement[] => {
  const saved = captureNoteSelection(root);
  if (!saved) return [];

  let last = saved.end.block;
  if (last > saved.start.block && saved.end.offset === 0) last -= 1;
  return getNoteBlocks(root)
    .slice(saved.start.block, last + 1)
    .filter((block) => !isAttachmentsBlock(block));
};