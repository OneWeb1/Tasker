import type { NoteLineAction } from '../../types/noteFormat';
import { rewriteLines } from './textEdit';
import type { TextEdit } from './textEdit';

interface LineRule {
  pattern: RegExp;
  prefix: (position: number) => string;
}

const INDENT = '  ';
const ANY_PREFIX = /^(?:#{1,6} |- \[[ xX]\] |- |\d+\. |> \[!info\] |> )/;

const LINE_RULES: Record<NoteLineAction, LineRule> = {
  h1: { pattern: /^# /, prefix: () => '# ' },
  h2: { pattern: /^## /, prefix: () => '## ' },
  h3: { pattern: /^### /, prefix: () => '### ' },
  h4: { pattern: /^#### /, prefix: () => '#### ' },
  bullet: { pattern: /^- (?!\[[ xX]\] )/, prefix: () => '- ' },
  number: { pattern: /^\d+\. /, prefix: (position) => `${position}. ` },
  check: { pattern: /^- \[[ xX]\] /, prefix: () => '- [ ] ' },
  quote: { pattern: /^> (?!\[!info\] )/, prefix: () => '> ' },
  callout: { pattern: /^> \[!info\] /, prefix: () => '> [!info] ' },
};

const splitIndent = (line: string): { indent: string; rest: string } => {
  const indent = /^\s*/.exec(line)?.[0] ?? '';
  return { indent, rest: line.slice(indent.length) };
};

export const toggleLinePrefix = (edit: TextEdit, action: NoteLineAction): TextEdit => {
  const rule = LINE_RULES[action];

  return rewriteLines(edit, (lines) => {
    const parts = lines.map(splitIndent);
    const isSingle = parts.length === 1;
    const targets = parts.filter(({ rest }) => rest !== '');
    const isRemoving = targets.length > 0 && targets.every(({ rest }) => rule.pattern.test(rest));
    let position = 0;

    return parts.map(({ indent, rest }) => {
      if (rest === '' && !isSingle) return indent;
      if (isRemoving) return indent + rest.replace(rule.pattern, '');
      position += 1;
      return indent + rule.prefix(position) + rest.replace(ANY_PREFIX, '');
    });

  });
};

export const shiftIndent = (edit: TextEdit, direction: 1 | -1): TextEdit =>
  rewriteLines(edit, (lines) =>
    lines.map((line) => {
      if (direction === -1) return line.replace(/^(?: {1,2}|\t)/, '');
      return line === '' && lines.length > 1 ? line : INDENT + line;
    }),
  );