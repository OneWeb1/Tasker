import { WORD_CHAR } from '../../model/constants';
import type { Caret } from '../../model/types';

export const expandToWord = ({ node, offset }: Caret): Range | null => {
  if (node.nodeType !== Node.TEXT_NODE) return null;

  const text = (node as Text).data;
  let start = Math.min(offset, text.length);
  let end = start;
  while (start > 0 && WORD_CHAR.test(text[start - 1])) start -= 1;
  while (end < text.length && WORD_CHAR.test(text[end])) end += 1;
  if (start === end) return null;

  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, end);
  return range;
};