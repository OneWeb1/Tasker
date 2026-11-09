import type { Caret } from '../../model/types';

export const isOrdered = (first: Caret, second: Caret): boolean => {
  const probe = document.createRange();
  probe.setStart(first.node, first.offset);
  probe.collapse(true);
  return probe.comparePoint(second.node, second.offset) >= 0;
};

export const rangeBetween = (first: Caret, second: Caret): Range => {
  const [start, end] = isOrdered(first, second) ? [first, second] : [second, first];
  const range = document.createRange();
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);
  return range;
};

export const extendRange = (anchor: Range, caret: Caret): Range => {
  const position = anchor.comparePoint(caret.node, caret.offset);
  if (position === 0) return anchor.cloneRange();

  const range = document.createRange();
  if (position < 0) {
    range.setStart(caret.node, caret.offset);
    range.setEnd(anchor.endContainer, anchor.endOffset);
  } else {
    range.setStart(anchor.startContainer, anchor.startOffset);
    range.setEnd(caret.node, caret.offset);
  }
  return range;
};