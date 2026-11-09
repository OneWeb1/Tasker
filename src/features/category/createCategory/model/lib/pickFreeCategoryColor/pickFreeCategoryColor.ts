import { CATEGORY_COLOR_PRESETS } from '@/entities/category';
import type { Category, CategoryColor } from '@/entities/category';

export const pickFreeCategoryColor = (categories: readonly Category[]): CategoryColor =>
  CATEGORY_COLOR_PRESETS.find(
    (color) => !categories.some((category) => category.color.toLowerCase() === color),
  ) ??
  CATEGORY_COLOR_PRESETS[0] ??
  '#8b5cf6';