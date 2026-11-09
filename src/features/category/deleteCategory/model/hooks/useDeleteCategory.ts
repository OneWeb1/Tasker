import { useCallback } from 'react';
import { useDeleteCategoryMutation, useRestoreDeletedCategoryMutation } from '@/entities/category';
import type { CategoryId, DeletedCategory } from '@/entities/category';

export function useDeleteCategory() {
  const [deleteCategoryMutation] = useDeleteCategoryMutation();
  const [restoreDeletedCategory] = useRestoreDeletedCategoryMutation();

  const deleteCategory = useCallback(
    (id: CategoryId): Promise<DeletedCategory | null> =>
      deleteCategoryMutation(id)
        .unwrap()
        .catch(() => null),
    [deleteCategoryMutation],
  );

  const undoDelete = useCallback(
    (snapshot: DeletedCategory) => {
      void restoreDeletedCategory(snapshot);
    },
    [restoreDeletedCategory],
  );

  return { deleteCategory, undoDelete };
}