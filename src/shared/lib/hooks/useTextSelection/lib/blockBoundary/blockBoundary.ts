import type { Caret } from '../../model/types';

const CELL_SELECTOR = '[data-cell]';

export const findSelectionBlock = (root: HTMLElement, node: Node): HTMLElement | null => {
  const element = node instanceof HTMLElement ? node : node.parentElement;
  if (!element) return null;

  const cell = element.closest<HTMLElement>(CELL_SELECTOR);
  if (cell && root.contains(cell)) return cell;

  let current: HTMLElement | null = element;
  while (current && current.parentElement !== root) current = current.parentElement;
  return current;
};

export const clampCaret = (block: HTMLElement, caret: Caret): Caret => {
  const bounds = document.createRange();
  bounds.selectNodeContents(block);
  const position = bounds.comparePoint(caret.node, caret.offset);
  if (position === 0) return caret;
  return position < 0
    ? { node: block, offset: 0 }
    : { node: block, offset: block.childNodes.length };
};