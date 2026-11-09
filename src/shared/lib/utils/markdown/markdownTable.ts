const SEPARATOR_PATTERN = /^\|(?:\s*:?-{3,}:?\s*\|)+$/;

const escapeCell = (cell: string): string => cell.replace(/\|/g, '\\|');

export const isTableSeparator = (text: string): boolean => SEPARATOR_PATTERN.test(text.trim());

export const matchTableRow = (text: string): string[] | null => {
  const value = text.trim();
  if (value.length < 2 || !value.startsWith('|') || !value.endsWith('|') || value.endsWith('\\|')) {
    return null;
  }

  const body = value.slice(1, -1);
  const cells: string[] = [];
  let current = '';

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    if (char === '\\' && body[index + 1] === '|') {
      current += '|';
      index += 1;
    } else if (char === '|') {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
};

export const formatTableRow = (cells: readonly string[]): string =>
  `| ${cells.map(escapeCell).join(' | ')} |`;

export const formatTableSeparator = (count: number): string =>
  `| ${Array.from({ length: Math.max(count, 1) }, () => '---').join(' | ')} |`;