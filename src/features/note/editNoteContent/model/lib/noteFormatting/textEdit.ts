export interface TextEdit {
  value: string;
  start: number;
  end: number;
}

interface LineBounds {
  from: number;
  to: number;
}

export const getLineBounds = ({ value, start, end }: TextEdit): LineBounds => {
  const from = start === 0 ? 0 : value.lastIndexOf('\n', start - 1) + 1;
  const last = end > start && value[end - 1] === '\n' ? end - 1 : end;
  const next = value.indexOf('\n', last);
  return { from, to: next === -1 ? value.length : next };
};

export const rewriteLines = (
  edit: TextEdit,
  transform: (lines: string[]) => string[],
): TextEdit => {
  const { value, start, end } = edit;
  const { from, to } = getLineBounds(edit);
  const block = transform(value.slice(from, to).split('\n')).join('\n');
  const result = value.slice(0, from) + block + value.slice(to);

  if (start !== end) return { value: result, start: from, end: from + block.length };

  const shifted = start + block.length - (to - from);
  const cursor = Math.min(Math.max(shifted, from), from + block.length);
  return { value: result, start: cursor, end: cursor };
};