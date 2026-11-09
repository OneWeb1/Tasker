import { CATEGORY_TITLE_MAX_LENGTH } from '@/entities/category';

const normalize = (title: string): string => title.trim().toLowerCase();

const withSuffix = (title: string, suffix: string): string =>
  `${title.slice(0, Math.max(CATEGORY_TITLE_MAX_LENGTH - suffix.length, 1)).trimEnd()}${suffix}`;

export const buildCategoryCopyTitle = (title: string, existingTitles: readonly string[]): string => {
  const taken = new Set(existingTitles.map(normalize));
  if (!taken.has(normalize(title))) return title;

  for (let attempt = 1; ; attempt += 1) {
    const suffix = attempt === 1 ? ' (копія)' : ` (копія ${attempt})`;
    const candidate = withSuffix(title, suffix);
    if (!taken.has(normalize(candidate))) return candidate;
  }
};