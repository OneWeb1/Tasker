import { createId } from '@/shared/lib/utils/createId';
import { JsonFieldError } from '@/shared/lib/utils/json';
import { formatAttachmentsLine } from '@/shared/lib/utils/markdown';
import type { MarkdownSlotKind } from '@/shared/lib/utils/markdown';
import { NOTE_SLOTS_MAX } from '../../constants/createItem';
import { expandToggleBlocks } from '../noteToggleBlocks';

const FENCE = '```';
const SLOT_PATTERN = /^\s*\[\[\s*(media|file)\s*(?::\s*([^\]]*?))?\s*\]\]\s*$/i;
const BULLET_PATTERN = /^(\s*)[*+] (?=\S)/;
const DEEP_HEADING_PATTERN = /^(\s*(?:<!--(?:center|right)-->)?)#{5,} /;
const INLINE_CODE_SPLIT = /(`[^`\n]*`)/;
const STAR_BOLD_ITALIC_PATTERN = /(^|[^*\w])\*\*\*([^\s*](?:[^*\n]*[^\s*])?)\*\*\*(?![*\w])/g;
const UNDERSCORE_BOLD_PATTERN = /(^|[^\w_])__([^\s_](?:[^_\n]*[^\s_])?)__(?![\w_])/g;
const STAR_ITALIC_PATTERN = /(^|[^*\w])\*([^\s*](?:[^*\n]*[^\s*])?)\*(?![*\w])/g;
const ALERT_PATTERN = /^(\s*)> \[!(?:note|info|tip|important|warning|caution)\][ \t]*/i;

const DEFAULT_SLOT_TITLES: Record<MarkdownSlotKind, string> = {
  media: 'Медіа',
  file: 'Файли',
};

const normalizeEmphasis = (line: string): string =>
  line
    .split(INLINE_CODE_SPLIT)
    .map((part, index) =>
      index % 2 === 1
        ? part
        : part
            .replace(STAR_BOLD_ITALIC_PATTERN, '$1**_$2_**')
            .replace(UNDERSCORE_BOLD_PATTERN, '$1**$2**')
            .replace(STAR_ITALIC_PATTERN, '$1_$2_'),
    )
    .join('');

export const normalizeNoteContent = (content: string): string => {
  let isFenced = false;
  let slotCount = 0;

  return expandToggleBlocks(content.replace(/^\uFEFF/, '').split(/\r?\n/))
    .map((line) => {
      const trimmed = line.trim();

      if (isFenced) {
        if (trimmed === FENCE) isFenced = false;
        return line;
      }
      if (trimmed.startsWith(FENCE)) {
        isFenced = true;
        return line;
      }

      const slot = SLOT_PATTERN.exec(line);
      if (slot) {
        slotCount += 1;
        if (slotCount > NOTE_SLOTS_MAX) {
          throw new JsonFieldError(
            `Забагато місць для вкладень у "content" (максимум ${NOTE_SLOTS_MAX})`,
          );
        }
        const kind: MarkdownSlotKind = slot[1].toLowerCase() === 'file' ? 'file' : 'media';
        return formatAttachmentsLine(createId(), {
          kind,
          title: slot[2]?.trim() || DEFAULT_SLOT_TITLES[kind],
        });
      }

      return normalizeEmphasis(
        line
          .replace(BULLET_PATTERN, '$1- ')
          .replace(DEEP_HEADING_PATTERN, '$1#### ')
          .replace(ALERT_PATTERN, '$1> [!info] '),
      );
    })
    .join('\n');

};