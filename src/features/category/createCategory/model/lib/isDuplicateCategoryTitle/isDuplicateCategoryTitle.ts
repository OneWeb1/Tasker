import type { Category } from '@/entities/category';

export const isDuplicateCategoryTitle = (
  categories: readonly Category[],
  title: string,
): boolean => {
  const normalized = title.trim().toLowerCase();
  return categories.some((category) => category.title.trim().toLowerCase() === normalized);
};