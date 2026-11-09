import { CATEGORY_EMOJIS, CATEGORY_TITLE_MAX_LENGTH } from '@/entities/category';
import type { Category } from '@/entities/category';
import { buildJsonPrompt } from '@/shared/lib/utils/json';
import type { JsonPromptField } from '@/shared/lib/utils/json';
import { CATEGORY_JSON_EXAMPLE } from '../../constants/categoryJson';

const FIELDS: readonly JsonPromptField[] = [
  {
    name: 'title',
    type: 'рядок',
    required: true,
    description: `Унікальна назва категорії, до ${CATEGORY_TITLE_MAX_LENGTH} символів.`,
  },
  {
    name: 'emoji',
    type: 'рядок',
    description: `Один емодзі, що відповідає категорії. Приклади: ${CATEGORY_EMOJIS.join(' ')}.`,
  },
  {
    name: 'color',
    type: 'рядок #RRGGBB',
    description: 'Колір категорії у форматі hex.',
  },
];

export const buildCategoryJsonPrompt = (categories: readonly Category[]): string =>
  buildJsonPrompt({
    subject: 'категорії завдань',
    fields: FIELDS,
    context:
      categories.length > 0
        ? [`Уже існують категорії (назви не повторюй): ${categories.map((item) => item.title).join(', ')}.`]
        : [],
    example: CATEGORY_JSON_EXAMPLE,
  });