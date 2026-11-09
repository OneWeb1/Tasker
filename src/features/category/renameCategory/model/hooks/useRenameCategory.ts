import { useCallback } from 'react';
import { useUpdateCategoryMutation } from '@/entities/category';
import type { CategoryId } from '@/entities/category';

export function useRenameCategory() {
  const [updateCategory] = useUpdateCategoryMutation();

  const renameCategory = useCallback(
    (id: CategoryId, title: string) => {
      const trimmed = title.trim();
      if (trimmed === '') return;
      void updateCategory({ id, patch: { title: trimmed } });
    },
    [updateCategory],
  );

  return { renameCategory };
}