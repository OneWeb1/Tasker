import { resolveWorkspaceId } from '@/entities/workspace';
import { DEFAULT_CATEGORY_ID } from '../../model/constants/categories';
import type { Category } from '../../model/types/category';

export const filterCategoriesByWorkspace = (
  categories: readonly Category[],
  workspaceId: string,
): Category[] =>
  categories.filter(
    (category) =>
      category.id === DEFAULT_CATEGORY_ID || resolveWorkspaceId(category.workspaceId) === workspaceId,
  );