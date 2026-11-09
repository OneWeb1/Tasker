import type { TextEdit } from './textEdit';

const FENCE = '```';

export const toggleInline = (
  { value, start, end }: TextEdit,
  open: string,
  close: string = open,
): TextEdit => {
  const before = value.slice(0, start);
  const selected = value.slice(start, end);
  const after = value.slice(end);

  const hasWrap = selected.length >= open.length + close.length;
  if (hasWrap && selected.startsWith(open) && selected.endsWith(close)) {
    const inner = selected.slice(open.length, selected.length - close.length);
    return { value: before + inner + after, start, end: start + inner.length };
  }

  if (before.endsWith(open) && after.startsWith(close)) {
    return {
      value: before.slice(0, before.length - open.length) + selected + after.slice(close.length),
      start: start - open.length,
      end: end - open.length,
    };
  }

  return {
    value: before + open + selected + close + after,
    start: start + open.length,
    end: end + open.length,
  };
};

export const wrapCodeBlock = ({ value, start, end }: TextEdit): TextEdit => {
  const before = value.slice(0, start);
  const selected = value.slice(start, end);
  const after = value.slice(end);
  const lead = before === '' || before.endsWith('\n') ? '' : '\n';
  const trail = after === '' || after.startsWith('\n') ? '' : '\n';
  const opening = `${lead}${FENCE}\n`;
  const cursor = before.length + opening.length;

  return {
    value: `${before}${opening}${selected}\n${FENCE}${trail}${after}`,
    start: cursor,
    end: cursor + selected.length,
  };
};