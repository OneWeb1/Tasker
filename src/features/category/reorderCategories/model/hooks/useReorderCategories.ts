import { useCallback } from 'react';
import { useReorderCategoriesMutation } from '@/entities/category';
import type { CategoryId } from '@/entities/category';

export function useReorderCategories() {
  const [reorder] = useReorderCategoriesMutation();

  const reorderCategories = useCallback(
    (ids: CategoryId[]) => {
      void reorder(ids);
    },
    [reorder],
  );

  return { reorderCategories };
}