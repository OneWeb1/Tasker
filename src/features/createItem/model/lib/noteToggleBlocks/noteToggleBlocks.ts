import { clampLevel } from '@/shared/lib/utils/markdown';

const INDENT = '  ';
const FENCE = '```';
const TOGGLE_PATTERN = /^\s*\[[+-]\] /;
const CLOSER_PATTERN = /^\s*\[\/\]\s*$/;
const ATTACHMENTS_PREFIX = '<!--attachments:';

const getLevel = (line: string): number =>
  Math.floor((line.length - line.trimStart().length) / INDENT.length);

const stripIndent = (line: string, width: number): string =>
  line.slice(Math.min(width, line.length - line.trimStart().length));

export const expandToggleBlocks = (lines: readonly string[]): string[] => {
  if (!lines.some((line) => CLOSER_PATTERN.test(line))) return [...lines];

  const output: string[] = [];
  let depth = 0;
  let isFenced = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const prefixed = trimmed === '' ? line : INDENT.repeat(depth) + line;

    if (isFenced) {
      output.push(prefixed);
      if (trimmed === FENCE) isFenced = false;
      continue;
    }
    if (CLOSER_PATTERN.test(line)) {
      depth = Math.max(depth - 1, 0);
      continue;
    }

    output.push(prefixed);
    if (trimmed.startsWith(FENCE)) isFenced = true;
    else if (TOGGLE_PATTERN.test(line)) depth = clampLevel(depth + 1);
  }

  return output;
};

export const collapseToggleBlocks = (content: string): string => {
  const output: string[] = [];
  const stack: number[] = [];
  let isFenced = false;
  let fenceStrip = 0;

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (isFenced) {
      output.push(stripIndent(line, fenceStrip));
      if (trimmed === FENCE) isFenced = false;
      continue;
    }

    if (trimmed !== '' && !trimmed.startsWith(ATTACHMENTS_PREFIX)) {
      const level = getLevel(line);
      while (stack.length > 0 && stack[stack.length - 1] >= level) {
        stack.pop();
        output.push('[/]');
      }
    }

    const strip = stack.length * INDENT.length;
    output.push(stripIndent(line, strip));

    if (trimmed.startsWith(FENCE)) {
      isFenced = true;
      fenceStrip = strip;
    } else if (TOGGLE_PATTERN.test(line)) {
      stack.push(getLevel(line));
    }
  }

  while (stack.pop() !== undefined) output.push('[/]');
  return output.join('\n');
};