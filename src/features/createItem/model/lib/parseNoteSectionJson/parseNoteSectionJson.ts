import {
  guardJson,
  parseJsonObject,
  readOptionalBoolean,
  readOptionalString,
  readRequiredString,
} from '@/shared/lib/utils/json';
import type { ParseResult } from '@/shared/lib/utils/json';
import type { NoteSectionUpdate } from '../noteSectionBlock';

export const parseNoteSectionJson = (raw: string): ParseResult<NoteSectionUpdate> => {
  const parsed = parseJsonObject(raw);
  if (!parsed.ok) return parsed;

  return guardJson(() => {
    const title = readRequiredString(parsed.value, 'title').replace(/\s+/g, ' ').trim();
    const content = (readOptionalString(parsed.value, 'content') ?? '').replace(
      /^(?:[ \t]*\r?\n)+|\s+$/g,
      '',
    );
    const isCollapsed = readOptionalBoolean(parsed.value, 'isCollapsed');
    return {
      title,
      content,
      ...(isCollapsed === undefined ? {} : { isCollapsed }),
    };
  });
};