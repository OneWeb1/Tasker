import { CATEGORY_EMOJIS, CATEGORY_TITLE_MAX_LENGTH, isHexColor } from '@/entities/category';
import type { Category, NewCategory } from '@/entities/category';
import {
  JsonFieldError,
  guardJson,
  parseJsonObject,
  readOptionalString,
  readRequiredString,
} from '@/shared/lib/utils/json';
import type { ParseResult } from '@/shared/lib/utils/json';
import { isDuplicateCategoryTitle } from '../isDuplicateCategoryTitle';
import { pickFreeCategoryColor } from '../pickFreeCategoryColor';

export const parseCategoryJson = (
  raw: string,
  categories: readonly Category[],
): ParseResult<NewCategory> => {
  const parsed = parseJsonObject(raw);
  if (!parsed.ok) return parsed;

  return guardJson(() => {
    const title = readRequiredString(parsed.value, 'title');
    if (title.length > CATEGORY_TITLE_MAX_LENGTH) {
      throw new JsonFieldError(`Назва не довша за ${CATEGORY_TITLE_MAX_LENGTH} символів`);
    }
    if (isDuplicateCategoryTitle(categories, title)) {
      throw new JsonFieldError('Така категорія вже є');
    }

    const emoji = readOptionalString(parsed.value, 'emoji')?.trim() || (CATEGORY_EMOJIS[0] ?? '🎯');

    const color = (
      readOptionalString(parsed.value, 'color')?.trim() ?? pickFreeCategoryColor(categories)
    ).toLowerCase();
    if (!isHexColor(color)) throw new JsonFieldError('Колір має бути у форматі #RRGGBB');

    return { title, emoji, color };

  });
};