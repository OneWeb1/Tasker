import { useCallback } from 'react';
import { useUpdateCategoryMutation } from '@/entities/category';
import type { Category, CategoryId } from '@/entities/category';

export type CategoryAppearance = Pick<Category, 'emoji' | 'color'>;

export function useEditCategoryAppearance() {
  const [updateCategory] = useUpdateCategoryMutation();

  const updateAppearance = useCallback(
    (id: CategoryId, appearance: CategoryAppearance) => {
      void updateCategory({ id, patch: appearance });
    },
    [updateCategory],
  );

  return { updateAppearance };
}