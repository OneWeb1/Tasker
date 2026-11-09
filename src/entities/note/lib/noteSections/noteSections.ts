const INDENT = '  ';
const FENCE = '```';
const ATTACHMENTS_PREFIX = '<!--attachments:';
const TOGGLE_PATTERN = /^\s*(?:<!--(?:center|right)-->)?\[[+-]\] /;

export interface NoteSection {
  ordinal: number;
  level: number;
  start: number;
  end: number;
  path: readonly string[];
  text: string;
}

interface Ancestor {
  level: number;
  title: string;
}

const getIndent = (line: string): number => line.length - line.trimStart().length;

const getLevel = (line: string): number => Math.floor(getIndent(line) / INDENT.length);

const isAttachmentsLine = (line: string): boolean => line.trim().startsWith(ATTACHMENTS_PREFIX);

const isNeutral = (line: string): boolean => line.trim() === '' || isAttachmentsLine(line);

const dedent = (line: string, width: number): string => line.slice(Math.min(width, getIndent(line)));

const findSectionEnd = (lines: readonly string[], start: number, level: number): number => {
  let end = start + 1;
  let isFenced = false;

  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (isFenced) {
      isFenced = trimmed !== FENCE;
      end = index + 1;
      continue;
    }
    if (!isNeutral(line) && getLevel(line) <= level) break;
    if (trimmed.startsWith(FENCE)) isFenced = true;
    if (trimmed !== '') end = index + 1;
  }

  return end;
};

export const readNoteSection = (content: string, ordinal: number): NoteSection | null => {
  const lines = content.split(/\r?\n/);
  const ancestors: Ancestor[] = [];
  let isFenced = false;
  let count = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (isFenced) {
      if (trimmed === FENCE) isFenced = false;
      continue;
    }
    if (isNeutral(line)) continue;

    const level = getLevel(line);
    while (ancestors.length > 0 && ancestors[ancestors.length - 1].level >= level) {
      ancestors.pop();
    }

    if (trimmed.startsWith(FENCE)) {
      isFenced = true;
      continue;
    }
    if (!TOGGLE_PATTERN.test(line)) continue;

    if (count === ordinal) {
      const end = findSectionEnd(lines, index, level);
      return {
        ordinal,
        level,
        start: index,
        end,
        path: ancestors.map((item) => item.title),
        text: lines
          .slice(index, end)
          .map((item) => dedent(item, level * INDENT.length))
          .join('\n'),
      };
    }

    count += 1;
    ancestors.push({ level, title: line.replace(TOGGLE_PATTERN, '').trim() });

  }

  return null;
};

export const replaceNoteSection = (
  content: string,
  section: NoteSection,
  block: string,
): string => {
  const lines = content.split(/\r?\n/);
  const padding = INDENT.repeat(section.level);
  const replacement = block.split('\n').map((line) => {
    if (line.trim() === '') return '';
    return isAttachmentsLine(line) ? line.trimStart() : padding + line;
  });

  lines.splice(section.start, section.end - section.start, ...replacement);
  return lines.join('\n');
};