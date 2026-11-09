const CARET_ANCHOR = '\u200b';
const ANCHOR_PATTERN = /\u200b/g;
const ANCHOR_ONLY_PATTERN = /^\u200b*$/;

export const createCaretAnchor = (): Text => document.createTextNode(CARET_ANCHOR);

export const stripCaretAnchor = (text: string): string => text.replace(ANCHOR_PATTERN, '');

export const isBlockBlank = (block: HTMLElement): boolean =>
  block.dataset.b !== 'attachments' && stripCaretAnchor(block.textContent ?? '') === '';

export const pruneCaretAnchors = (root: HTMLElement): void => {
  const selection = window.getSelection();

  for (const code of Array.from(root.querySelectorAll('code, mark'))) {
    if (!ANCHOR_ONLY_PATTERN.test(code.textContent ?? '')) continue;
    if (selection?.anchorNode && code.contains(selection.anchorNode)) continue;
    code.remove();
  }
};