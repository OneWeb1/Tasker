import type { Caret } from '../../model/types';

type CaretPositionApi = (x: number, y: number) => CaretPosition | null;

export const caretFromPoint = (x: number, y: number): Caret | null => {
  if (typeof document.caretRangeFromPoint === 'function') {
    const range = document.caretRangeFromPoint(x, y);
    return range ? { node: range.startContainer, offset: range.startOffset } : null;
  }

  const position = (
    document as unknown as { caretPositionFromPoint?: CaretPositionApi }
  ).caretPositionFromPoint?.(x, y);
  return position ? { node: position.offsetNode, offset: position.offset } : null;
};

const PROBES: readonly number[] = [0, -6, 6, -12, 12, -20, 20];

const isVisibleText = (node: Node): boolean =>
  (node as Text).data.length > 0 &&
  node.parentElement !== null &&
  node.parentElement.closest('[data-hidden]') === null;

const edgeCaret = (root: HTMLElement, edge: 'start' | 'end'): Caret | null => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      isVisibleText(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  let found: Text | null = null;
  while (walker.nextNode()) {
    found = walker.currentNode as Text;
    if (edge === 'start') break;
  }
  if (!found) return null;
  return { node: found, offset: edge === 'start' ? 0 : found.data.length };
};

export const caretInRoot = (root: HTMLElement, x: number, y: number): Caret | null => {
  for (const shift of PROBES) {
    const caret = caretFromPoint(x, y + shift);
    if (caret && caret.node.nodeType === Node.TEXT_NODE && root.contains(caret.node)) {
      return caret;
    }
  }

  const rect = root.getBoundingClientRect();
  if (y > rect.bottom) return edgeCaret(root, 'end');
  if (y < rect.top) return edgeCaret(root, 'start');
  return null;
};