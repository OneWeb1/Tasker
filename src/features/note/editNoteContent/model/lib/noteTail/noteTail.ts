import { isBlockBlank } from '../noteAnchor';
import { createNoteBlock, getBlockKind, getNoteBlocks } from '../noteDocument';
import { placeCaret } from '../noteSelection';

export const isBelowNoteBlocks = (root: HTMLElement, clientY: number): boolean => {
  const blocks = getNoteBlocks(root);
  const last = blocks[blocks.length - 1];
  return last !== undefined && clientY > last.getBoundingClientRect().bottom;
};

export const focusNoteTail = (root: HTMLElement): void => {
  const blocks = getNoteBlocks(root);
  const last = blocks[blocks.length - 1];
  const needsBlock =
    !last ||
    last.hasAttribute('data-hidden') ||
    ['hr', 'table'].includes(getBlockKind(last)) ||
    (getBlockKind(last) !== 'p' && !isBlockBlank(last));

  let target: HTMLElement = last;
  if (needsBlock) {
    target = createNoteBlock();
    root.append(target);
  }

  placeCaret(root, target, 'end');
};